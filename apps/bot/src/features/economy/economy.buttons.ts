import type { ButtonInteraction } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { buildToplistButtonRow, buildToplistEmbed } from "./economy.embeds.js";
import { getRank, getToplistPage } from "./economy.service.js";

const TOPLIST_PREFIX = "economy:toplist:";

const toplistPaginationHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith(TOPLIST_PREFIX);
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError(
        "This button can only be used inside a server.",
      );
    }

    await interaction.deferUpdate();

    const [pageRaw, targetUserId] = interaction.customId
      .slice(TOPLIST_PREFIX.length)
      .split(":");
    const requestedPage = Number(pageRaw);
    const page = Number.isFinite(requestedPage) ? requestedPage : 1;
    const userId = targetUserId ?? interaction.user.id;

    const rank = await getRank(interaction.guildId, userId);
    const description = rank
      ? `<@${userId}> is #${rank} in the toplist`
      : `<@${userId}> has no token yet.`;

    const {
      entries,
      page: resolvedPage,
      totalPages,
    } = await getToplistPage(interaction.guildId, page);

    await interaction.editReply({
      embeds: [
        buildToplistEmbed(entries, resolvedPage, totalPages, description),
      ],
      components: [buildToplistButtonRow(resolvedPage, totalPages, userId)],
    });
  },
};

export const economyButtons: ButtonHandler[] = [toplistPaginationHandler];
