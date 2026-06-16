/**
 * Shapes returned by the Lovense Connect/Standard API.
 *
 * The API always returns `result` plus a numeric `code`; `data` is only
 * present on success. See https://developer.lovense.com for the upstream
 * reference.
 */

export interface LovenseApiSuccess<T> {
  readonly result: true;
  readonly code: number;
  readonly message?: string;
  readonly data: T;
}

export interface LovenseApiFailure {
  readonly result: false;
  readonly code: number;
  readonly message: string;
}

export type LovenseApiResponse<T> = LovenseApiSuccess<T> | LovenseApiFailure;

export interface LovenseQrCodeData {
  /** Image URL for the pairing QR code. */
  readonly qr: string;
  /** Numeric code an app can type in instead of scanning the QR image. */
  readonly code: string;
}

export interface LovenseToy {
  readonly id: string;
  readonly name: string;
  readonly nickName: string;
  /** `1` (sometimes returned as the string `"1"`) when the toy is connected and ready to receive commands. */
  readonly status: number | string;
  /** Battery percentage, or `-1` for toys that don't report one. */
  readonly battery: number;
  readonly version: string;
}
