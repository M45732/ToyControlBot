import { type Client, ThreadChannel } from "discord.js";

import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";

const log = createLogger("subscriptions");

/**
 * Fetch a fanclub thread by id, or throw a user-facing error if it no longer
 * exists / is not a thread. Used before charging a member so we never take
 * tokens for access to a thread we cannot reach.
 */
export async function fetchThreadOrThrow(
  client: Client,
  threadId: string,
): Promise<ThreadChannel> {
  const channel = await client.channels.fetch(threadId).catch(() => null);
  if (!(channel instanceof ThreadChannel)) {
    throw new UserFacingError(
      "This subscription's thread no longer exists. Ask the performer to set it up again.",
    );
  }
  return channel;
}

/**
 * Whether a fanclub thread still exists and is reachable by the bot. Used by
 * the renewal sweep to avoid charging for access it can no longer deliver.
 */
export async function isThreadReachable(
  client: Client,
  threadId: string,
): Promise<boolean> {
  const channel = await client.channels.fetch(threadId).catch(() => null);
  return channel instanceof ThreadChannel;
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
 * Returns whether access is now revoked. A deleted thread counts as revoked
 * (access is gone either way). A failed `members.remove` returns false so the
 * caller can keep the subscription retryable instead of marking it expired
 * while the member still has access.
 */
export async function removeFromThread(
  client: Client,
  threadId: string,
  userId: string,
): Promise<boolean> {
  const channel = await client.channels.fetch(threadId).catch(() => null);
  if (!(channel instanceof ThreadChannel)) {
    return true;
  }
  try {
    await channel.members.remove(userId);
    return true;
  } catch (err) {
    log.warn(
      { err, threadId, userId },
      "Failed to remove subscriber from thread",
    );
    return false;
  }
}
