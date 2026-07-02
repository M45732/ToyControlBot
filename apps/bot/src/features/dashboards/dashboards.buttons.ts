import { type ButtonInteraction } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";
import {
  buildDailyEmbed,
  buildPatronButtonRow,
  buildToplistButtonRow,
  buildToplistEmbed,
} from "../economy/economy.embeds.js";
import { isPatron, isServerBooster, isVerified } from "../economy/economy.permissions.js";
import { claimDaily, getBalance, getRank, getToplistPage } from "../economy/economy.service.js";
import { buildPairingEmbed } from "../lovense/lovense.embeds.js";
import { getConnectedToys, requestPairingQr } from "../lovense/lovense.service.js";
import { startSession } from "../lovense/session.service.js";
import { buildSubscriptionsEmbed } from "../subscriptions/subscription.embeds.js";
import { listSubscriptionsForUser } from "../subscriptions/subscription.service.js";

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
      case "daily": {
        const member = await requireGuildMember(interaction);
        if (!isVerified(member)) {
          throw new UserFacingError(
            "You are not verified! Please verify to get free daily tokens + bonus tokens.",
          );
        }

        await interaction.deferReply({ ephemeral: true });

        const result = await claimDaily(interaction.guildId, interaction.user.id, {
          isBooster: isServerBooster(member),
          isPatron: isPatron(member),
          eventId: interaction.id,
        });

        await interaction.editReply({
          embeds: [buildDailyEmbed(result)],
          components: result.claimed ? [buildPatronButtonRow()] : [],
        });
        return;
      }

      case "balance": {
        const balance = await getBalance(interaction.guildId, interaction.user.id);
        await interaction.reply({
          content: `Your account has ${balance} token`,
          ephemeral: true,
        });
        return;
      }

      case "toplist": {
        await interaction.deferReply({ ephemeral: true });

        const [rank, { entries, page, totalPages }] = await Promise.all([
          getRank(interaction.guildId, interaction.user.id),
          getToplistPage(interaction.guildId, 1),
        ]);
        const description = rank
          ? `<@${interaction.user.id}> is #${rank} in the toplist`
          : `<@${interaction.user.id}> has no token yet.`;

        await interaction.editReply({
          embeds: [buildToplistEmbed(entries, page, totalPages, description)],
          components: [buildToplistButtonRow(page, totalPages, interaction.user.id)],
        });
        return;
      }

      case "connect-toy": {
        await interaction.deferReply({ ephemeral: true });
        const qr = await requestPairingQr(interaction.user.id);
        await interaction.editReply({ embeds: [buildPairingEmbed(qr)] });
        return;
      }

      case "subscriptions": {
        const subs = await listSubscriptionsForUser(interaction.guildId, interaction.user.id);
        await interaction.reply({
          content:
            "To join a fanclub use `/subscribe performer:@name`. Performers: set up your fanclub with `/subscription-setup` and track it with `/subscription-stats`.",
          embeds: [buildSubscriptionsEmbed(subs)],
          ephemeral: true,
        });
        return;
      }

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
