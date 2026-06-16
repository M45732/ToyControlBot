/**
 * Environment variable helpers.
 *
 * Prefer these helpers over reading `process.env` directly so that missing
 * configuration fails fast with a clear, actionable error instead of a vague
 * `undefined` somewhere deep in the call stack.
 */

/**
 * Read a required environment variable.
 *
 * @throws If the variable is missing or empty.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Read an optional environment variable, returning `fallback` when unset.
 */
export function getOptionalEnv(
  name: string,
  fallback?: string,
): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  return value;
}
