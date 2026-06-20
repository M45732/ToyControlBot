import { EmbedBuilder } from "discord.js";

import type { LovenseQrCodeData } from "./lovense.types.js";
import type { ToyStatus } from "./lovense.service.js";

const BRAND_COLOR = 0x0099ff;

export function buildPairingEmbed(qr: LovenseQrCodeData): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Connect your toy")
    .setColor(BRAND_COLOR)
    .addFields(
      {
        name: "1) Download the app",
        value:
          "Download / open the Lovense Remote app " +
          "([Android](https://play.google.com/store/apps/details?id=com.lovense.remote) / " +
          "[iOS](https://apps.apple.com/us/app/lovense-remote/id1027312824)).",
      },
      { name: "2) Connect your toy(s)", value: "Connect your toy(s) in the app." },
      {
        name: "3) Scan the QR code",
        value:
          "In the app, tap **[+] → Scan QR** and scan the image below, " +
          "or tap the gallery icon and enter the code manually.",
      },
      { name: "Code", value: qr.code },
    )
    .setImage(qr.qr);
}

export function buildToyStatusEmbed(status: ToyStatus): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Toy status")
    .setColor(BRAND_COLOR);

  switch (status.state) {
    case "connected":
      embed.setDescription(
        status.toys
          .map((toy) => `🔋 ${toy.batteryPercent}% — ${toy.name}`)
          .join("\n"),
      );
      break;
    case "no-toys":
      embed.setDescription(
        "The Lovense Connect app is running, but no toys are connected.",
      );
      break;
    case "app-offline":
      embed.setDescription(
        "The Lovense Connect app appears to be offline. Open it on your device and try again.",
      );
      break;
  }

  return embed;
}
