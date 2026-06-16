/**
 * Error helpers.
 *
 * The goal is to keep a clean boundary between *internal* error detail (logged
 * with full context) and *user-facing* messages (friendly, no stack traces, no
 * secrets, no internal config names).
 */

/**
 * An error whose `message` is safe to show directly to a Discord user.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

/**
 * Normalise an unknown thrown value into an `Error` for safe logging.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  return new Error(typeof value === "string" ? value : JSON.stringify(value));
}

/**
 * Resolve a friendly, user-safe message for any thrown value.
 *
 * Internal errors are deliberately collapsed to a generic message so we never
 * leak stack traces, database errors, or configuration details to users.
 */
export function toUserMessage(value: unknown): string {
  if (value instanceof UserFacingError) {
    return value.message;
  }
  return "Something went wrong while handling that. Please try again later.";
}
