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
 * Best-effort and idempotent: missing membership or a deleted thread is fine.
 */
export async function removeFromThread(
  client: Client,
  threadId: string,
  userId: string,
): Promise<void> {
  const channel = await client.channels.fetch(threadId).catch(() => null);
  if (!(channel instanceof ThreadChannel)) {
    return;
  }
  await channel.members
    .remove(userId)
    .catch((err: unknown) =>
      log.warn(
        { err, threadId, userId },
        "Failed to remove subscriber from thread",
      ),
    );
}
