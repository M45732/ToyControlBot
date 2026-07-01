import type { ModalSubmitInteraction } from "discord.js";

import type { ModalHandler } from "../../modals/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { detectControlLink } from "./control-link.service.js";
import { messageStepRow } from "./control-link-dm.buttons.js";
import { buildMessageStepEmbed, readLinkFromEmbed } from "./control-link-dm.service.js";

const messageModalHandler: ModalHandler = {
  matches: (customId) => customId === "control-link-dm:message-modal",
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

export const controlLinkDmModals: ModalHandler[] = [messageModalHandler];
