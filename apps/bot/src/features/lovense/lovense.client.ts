import { config } from "../../config/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";
import type {
  LovenseApiResponse,
  LovenseQrCodeData,
  LovenseToy,
} from "./lovense.types.js";

const log = createLogger("lovense");

/**
 * Thin wrapper around the Lovense Connect/Standard API.
 *
 * The API token is read from config (env-only — never hardcode it, see
 * docs/migration-notes.md for why the legacy YAML token must be treated as
 * compromised).
 */
function requireApiToken(): string {
  const { apiToken } = config.lovense;
  if (!apiToken) {
    throw new UserFacingError(
      "Toy control isn't configured on this server yet.",
    );
  }
  return apiToken;
}

async function callLovenseApi<T>(
  path: string,
  params: Record<string, string>,
): Promise<LovenseApiResponse<T>> {
  const body = new URLSearchParams({ token: requireApiToken(), ...params });

  let response: Response;
  try {
    response = await fetch(`${config.lovense.apiBaseUrl}${path}`, {
      method: "POST",
      body,
    });
  } catch (error) {
    log.error({ err: error, path }, "Lovense API request failed");
    throw new UserFacingError(
      "Couldn't reach the Lovense API. Please try again later.",
    );
  }

  return (await response.json()) as LovenseApiResponse<T>;
}

/**
 * Request a pairing QR code for a Discord user.
 *
 * The user's Discord ID is sent as both `uid` and `uname` so it can be used
 * later to look up their connected toys.
 */
export function requestQrCode(
  uid: string,
): Promise<LovenseApiResponse<LovenseQrCodeData>> {
  return callLovenseApi<LovenseQrCodeData>("/api/lan/getQrCode", {
    uid,
    uname: uid,
    v: "2",
  });
}

/**
 * List the toys currently registered for a user, keyed by toy id.
 */
export function getToys(
  uid: string,
): Promise<LovenseApiResponse<Record<string, LovenseToy>>> {
  return callLovenseApi<Record<string, LovenseToy>>("/api/lan/command", {
    uid,
    command: "GetToys",
  });
}
