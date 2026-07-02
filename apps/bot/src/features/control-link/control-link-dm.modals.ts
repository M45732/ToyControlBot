import type { ModalSubmitInteraction } from "discord.js";

import type { ModalHandler } from "../../modals/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { detectControlLink, resolveRaffleChannel } from "./control-link.service.js";
import { PREFIX, anonymousChoiceRow, messageStepRow } from "./control-link-dm.buttons.js";
import {
  buildAnonymousChoiceEmbed,
  buildMessageStepEmbed,
  readLinkFromEmbed,
} from "./control-link-dm.service.js";

const messageModalHandler: ModalHandler = {
  matches: (customId) => customId === `${PREFIX}message-modal`,
  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.isFromMessage()) {
      throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
    }

    const url = readLinkFromEmbed(interaction.message.embeds[0] ?? null);
    const link = url ? detectControlLink(url) : null;
    if (!link) {
      throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
    }

    const anonymous =
      interaction.message.embeds[0]?.fields.find((field) => field.name === "Anonymous")?.value ===
      "yes";
    const message = interaction.fields.getTextInputValue("message-text").trim();

    await interaction.update({
      embeds: [buildMessageStepEmbed(link, anonymous, message)],
      components: [messageStepRow()],
    });
  },
};

/**
 * Submit handler for the `/control-link-raffle` link-entry modal. Unlike
 * `messageModalHandler`, this one isn't attached to an existing wizard
 * message — it's the very first response, so it replies (ephemerally)
 * rather than updating, then hands off to the same anonymous/reveal step.
 */
const linkModalHandler: ModalHandler = {
  matches: (customId) => customId === `${PREFIX}link-modal`,
  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const url = interaction.fields.getTextInputValue("link-text").trim();
    const link = detectControlLink(url);
    if (!link) {
      throw new UserFacingError(
        "That doesn't look like a supported control link (Lovense, Handyfeeling, or xtoys).",
      );
    }

    const target = await resolveRaffleChannel(interaction.client);
    if (!target) {
      throw new UserFacingError("Sorry, this bot isn't set up to raffle control links right now.");
    }

    const isMember = await target.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!isMember) {
      throw new UserFacingError(
        `You need to be a member of **${target.guild.name}** to raffle a link there.`,
      );
    }

    await interaction.reply({
      embeds: [buildAnonymousChoiceEmbed(link)],
      components: [anonymousChoiceRow()],
      ephemeral: true,
    });
  },
};

export const controlLinkDmModals: ModalHandler[] = [messageModalHandler, linkModalHandler];
