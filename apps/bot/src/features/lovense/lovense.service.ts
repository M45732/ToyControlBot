import { UserFacingError } from "../../lib/errors.js";
import { getToys, requestQrCode } from "./lovense.client.js";
import type { LovenseQrCodeData } from "./lovense.types.js";

export interface ConnectedToy {
  readonly name: string;
  readonly batteryPercent: number;
}

export type ToyStatus =
  | { readonly state: "connected"; readonly toys: ConnectedToy[] }
  | { readonly state: "no-toys" }
  | { readonly state: "app-offline" };

/**
 * Request a pairing QR code for a Discord user.
 *
 * @throws {UserFacingError} If the Lovense API is unreachable or rejects the request.
 */
export async function requestPairingQr(
  discordUserId: string,
): Promise<LovenseQrCodeData> {
  const response = await requestQrCode(discordUserId);
  if (!response.result) {
    throw new UserFacingError(
      `The Lovense API rejected the pairing request: ${response.message}`,
    );
  }
  return response.data;
}

/**
 * Get the toys currently connected for a Discord user via the Lovense Connect app.
 *
 * Returns a discriminated status instead of throwing, since "app offline" and
 * "no toys connected" are both expected, common states (not errors).
 */
export async function getConnectedToys(
  discordUserId: string,
): Promise<ToyStatus> {
  const response = await getToys(discordUserId);
  if (!response.result) {
    return { state: "app-offline" };
  }

  const toys: ConnectedToy[] = Object.values(response.data)
    .filter((toy) => toy.status === 1)
    .map((toy) => ({
      name: toy.nickName || toy.name,
      // The API reports `-1` for toys that don't expose a battery level.
      batteryPercent: toy.battery < 0 ? 100 : toy.battery,
    }));

  return toys.length > 0 ? { state: "connected", toys } : { state: "no-toys" };
}
