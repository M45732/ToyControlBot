import type { ModalSubmitInteraction } from "discord.js";

import type { ModalHandler } from "../../modals/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { detectControlLink, requireRaffleTarget } from "./control-link.service.js";
import { PREFIX, anonymousChoiceRow, messageStepRow } from "./control-link-dm.buttons.js";
import {
  buildAnonymousChoiceEmbed,
  buildMessageStepEmbed,
  readWizardState,
} from "./control-link-dm.service.js";

const messageModalHandler: ModalHandler = {
  matches: (customId) => customId === `${PREFIX}message-modal`,
  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.isFromMessage()) {
      throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
    }

    const state = readWizardState(interaction.message.embeds[0] ?? null);
    if (!state) {
      throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
    }

    const message = interaction.fields.getTextInputValue("message-text").trim();

    await interaction.update({
      embeds: [buildMessageStepEmbed(state.link, state.anonymous, message)],
      components: [messageStepRow()],
    });
  },
};

/**
 * Submit handler for the `/control-link-raffle` link-entry modal. Unlike
 * `messageModalHandler`, this one isn't attached to an existing wizard
 * message — it's the very first response, so it defers/replies (ephemerally)
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

    // Ack first — resolving the target channel and checking access are both
    // REST-backed and could otherwise blow the 3-second ack window.
    await interaction.deferReply({ ephemeral: true });

    const target = await requireRaffleTarget(interaction.client, interaction.user.id);

    await interaction.editReply({
      embeds: [buildAnonymousChoiceEmbed(link)],
      components: [anonymousChoiceRow()],
    });
  },
};

export const controlLinkDmModals: ModalHandler[] = [messageModalHandler, linkModalHandler];
