import { type Client, DiscordAPIError, ThreadChannel } from "discord.js";

import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";

const log = createLogger("subscriptions");

// Discord REST error codes we special-case.
const UNKNOWN_CHANNEL = 10003;
const UNKNOWN_MEMBER = 10007;

function isDiscordErrorCode(err: unknown, code: number): boolean {
  return err instanceof DiscordAPIError && err.code === code;
}

/**
 * The result of trying to resolve a fanclub thread:
 * - `ok`: the thread exists and is usable.
 * - `gone`: the thread is genuinely deleted/unknown (access is effectively revoked).
 * - `unreachable`: a transient failure (e.g. API error, temporary access loss);
 *   the caller should retry later rather than treat it as deleted.
 */
export type ThreadResolution =
  | { readonly state: "ok"; readonly thread: ThreadChannel }
  | { readonly state: "gone" }
  | { readonly state: "unreachable" };

/**
 * Resolve a fanclub thread, distinguishing a genuinely deleted thread from a
 * transient fetch failure so callers don't lapse subscriptions on a blip.
 */
export async function resolveThread(
  client: Client,
  threadId: string,
): Promise<ThreadResolution> {
  let channel;
  try {
    channel = await client.channels.fetch(threadId);
  } catch (err) {
    if (isDiscordErrorCode(err, UNKNOWN_CHANNEL)) {
      return { state: "gone" };
    }
    log.warn({ err, threadId }, "Thread fetch failed (transient)");
    return { state: "unreachable" };
  }
  if (!(channel instanceof ThreadChannel)) {
    return { state: "gone" };
  }
  return { state: "ok", thread: channel };
}

/**
 * Fetch a fanclub thread by id, or throw a user-facing error if it no longer
 * exists / is not a thread. Used before charging a member so we never take
 * tokens for access to a thread we cannot reach.
 */
export async function fetchThreadOrThrow(
  client: Client,
  threadId: string,
): Promise<ThreadChannel> {
  const resolution = await resolveThread(client, threadId);
  if (resolution.state !== "ok") {
    throw new UserFacingError(
      "This subscription's thread isn't reachable right now. Please try again later or ask the performer to set it up again.",
    );
  }
  return resolution.thread;
}

/**
 * Whether a user is already a member of the thread. Used so a failed subscribe
 * only revokes access it actually granted (not a pre-existing/manual membership).
 */
export async function isThreadMember(
  thread: ThreadChannel,
  userId: string,
): Promise<boolean> {
  try {
    await thread.members.fetch(userId);
    return true;
  } catch (err) {
    if (isDiscordErrorCode(err, UNKNOWN_MEMBER)) {
      return false;
    }
    // Unknown — assume not a member so we don't suppress a needed revocation,
    // but log it since it may indicate a permissions problem.
    log.warn(
      { err, threadId: thread.id, userId },
      "Thread membership check failed",
    );
    return false;
  }
}

/**
 * Add a subscriber to the fanclub thread. Best-effort: a failure here (e.g.
 * the bot lacks access to the private thread) is logged, not thrown, so the
 * already-committed token charge isn't lost — callers surface a soft warning.
 *
 * @returns whether the member was successfully added.
 */
export async function addToThread(
  thread: ThreadChannel,
  userId: string,
): Promise<boolean> {
  try {
    await thread.members.add(userId);
    return true;
  } catch (err) {
    log.warn(
      { err, threadId: thread.id, userId },
      "Failed to add subscriber to thread",
    );
    return false;
  }
}

/**
 * Remove a member from a fanclub thread when their subscription lapses.
 *
 * Returns whether access is now revoked. A genuinely deleted thread or an
 * already-absent member counts as revoked. A transient fetch/remove failure
 * returns false so the caller keeps the subscription retryable instead of
 * finalizing it while the member may still have access.
 */
export async function removeFromThread(
  client: Client,
  threadId: string,
  userId: string,
): Promise<boolean> {
  const resolution = await resolveThread(client, threadId);
  if (resolution.state === "gone") {
    return true;
  }
  if (resolution.state === "unreachable") {
    return false;
  }
  try {
    await resolution.thread.members.remove(userId);
    return true;
  } catch (err) {
    if (isDiscordErrorCode(err, UNKNOWN_MEMBER)) {
      return true; // already not a member → access is revoked
    }
    log.warn(
      { err, threadId, userId },
      "Failed to remove subscriber from thread; will retry",
    );
    return false;
  }
}
