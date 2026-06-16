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

    const requestedPage = Number(
      interaction.customId.slice(TOPLIST_PREFIX.length),
    );
    const page = Number.isFinite(requestedPage) ? requestedPage : 1;

    const rank = await getRank(interaction.guildId, interaction.user.id);
    const description = rank
      ? `<@${interaction.user.id}> is #${rank} in the toplist`
      : `<@${interaction.user.id}> has no token yet.`;

    const {
      entries,
      page: resolvedPage,
      totalPages,
    } = await getToplistPage(interaction.guildId, page);

    await interaction.editReply({
      embeds: [
        buildToplistEmbed(entries, resolvedPage, totalPages, description),
      ],
      components: [buildToplistButtonRow(resolvedPage, totalPages)],
    });
  },
};

export const economyButtons: ButtonHandler[] = [toplistPaginationHandler];
