import { Events, type Interaction } from "discord.js";

import { findButtonHandler } from "../buttons/index.js";
import { findCommand } from "../commands/index.js";
import { createLogger } from "../lib/logger.js";
import { toError, toUserMessage } from "../lib/errors.js";
import { defineEvent } from "./types.js";

const log = createLogger("interactionCreate");

export const interactionCreateEvent = defineEvent({
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const command = findCommand(interaction.commandName);
      if (!command) {
        log.warn(
          { command: interaction.commandName },
          "Received unknown command",
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        log.error(
          { err: toError(error), command: interaction.commandName },
          "Command failed",
        );
        const content = toUserMessage(error);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const handler = findButtonHandler(interaction.customId);
      if (!handler) {
        return;
      }

      try {
        await handler.execute(interaction);
      } catch (error) {
        log.error(
          { err: toError(error), customId: interaction.customId },
          "Button handler failed",
        );
        const content = toUserMessage(error);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  },
});
