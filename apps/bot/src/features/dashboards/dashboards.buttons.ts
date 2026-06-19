import { type ButtonInteraction } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { getConnectedToys } from "../lovense/lovense.service.js";
import { startSession } from "../lovense/session.service.js";

const dashboardButtonHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith("dashboard:");
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const action = interaction.customId.slice("dashboard:".length);

    switch (action) {
      case "daily":
        await interaction.reply({
          content: "Use `/daily` to claim your daily tokens!",
          ephemeral: true,
        });
        return;

      case "balance":
        await interaction.reply({
          content: "Use `/token-balance` to view your balance or history.",
          ephemeral: true,
        });
        return;

      case "toplist":
        await interaction.reply({
          content: "Use `/token-toplist` to see the leaderboard.",
          ephemeral: true,
        });
        return;

      case "connect-toy":
        await interaction.reply({
          content: "Use `/toy-connect` to get a QR code and pair your Lovense toy.",
          ephemeral: true,
        });
        return;

      case "subscriptions":
        await interaction.reply({
          content:
            "Performers: set up a paid fanclub with `/subscription-setup` and track it with `/subscription-stats`. Members: browse with `/subscribe` and `/subscriptions`.",
          ephemeral: true,
        });
        return;

      case "start-gangbang":
      case "start-orgy": {
        const mode = action === "start-gangbang" ? "gangbang" : "orgy";

        await interaction.deferReply({ ephemeral: true });

        const toyStatus = await getConnectedToys(interaction.user.id);
        if (toyStatus.state === "app-offline") {
          throw new UserFacingError(
            "Your Lovense app is offline. Start the app, connect your toy, then try again.",
          );
        }
        if (toyStatus.state === "no-toys") {
          throw new UserFacingError(
            "No toy is connected to your Lovense app. Connect a toy then try again.",
          );
        }

        const messageId = await startSession(
          interaction.client,
          interaction.guildId,
          interaction.channelId,
          interaction.user.id,
          mode,
        );

        await interaction.editReply({
          content: `Session started! https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${messageId}`,
        });
        return;
      }

      default:
        await interaction.reply({ content: "Unknown dashboard action.", ephemeral: true });
    }
  },
};

export const dashboardButtons: ButtonHandler[] = [dashboardButtonHandler];
