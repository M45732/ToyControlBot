import { type ButtonInteraction } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { getConnectedToys } from "./lovense.service.js";
import { endSession, joinSession, leaveSession } from "./session.service.js";

const leaveHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId === "session:leave";
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const result = await leaveSession(interaction.message.id, interaction.user.id);

    switch (result) {
      case "ended":
        await interaction.message.delete().catch(() => undefined);
        await interaction.reply({ content: "Session ended.", ephemeral: true });
        break;
      case "left":
        await interaction.reply({ content: "You left the session.", ephemeral: true });
        break;
      case "not-found":
        await interaction.reply({ content: "No active session found.", ephemeral: true });
        break;
    }
  },
};

const joinHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith("session:join:");
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const messageId = interaction.customId.slice("session:join:".length);

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

    const joined = await joinSession(messageId, interaction.user.id);
    if (!joined) {
      await interaction.reply({
        content: "You're already in this session or it has ended.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: "You joined the session! React with 0️⃣–5️⃣ to vote the vibration level.",
      ephemeral: true,
    });
  },
};

export const sessionButtons: ButtonHandler[] = [leaveHandler, joinHandler];
