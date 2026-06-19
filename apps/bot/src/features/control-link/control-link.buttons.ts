import { type ButtonInteraction, EmbedBuilder } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { joinRaffle, pickWinner } from "./control-link.service.js";

const joinRaffleHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith("raffle:join:");
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const raffleMessageId = interaction.customId.slice("raffle:join:".length);
    const result = await joinRaffle(raffleMessageId, interaction.user.id);

    if (!result) {
      await interaction.reply({ content: "This raffle has already ended.", ephemeral: true });
      return;
    }

    await interaction.reply({
      content: result.joined
        ? `You entered the raffle! (${result.participantCount} participant(s))`
        : "You're already in this raffle.",
      ephemeral: true,
    });
  },
};

const endRaffleHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith("raffle:end:");
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const raffleMessageId = interaction.customId.slice("raffle:end:".length);
    const result = await pickWinner(raffleMessageId, interaction.user.id);

    if (result === null) {
      throw new UserFacingError("This raffle has already ended.");
    }
    if (result === "not-host") {
      throw new UserFacingError("Only the raffle host can end it.");
    }
    if (result === "empty") {
      // Raffle stays active — reply privately so the public embed is untouched.
      await interaction.reply({ content: "No one has entered yet. The raffle is still open.", ephemeral: true });
      return;
    }

    const { winnerId, link } = result;

    const embed = new EmbedBuilder()
      .setTitle("Raffle Winner!")
      .setDescription(`🎉 <@${winnerId}> won control of the link!`)
      .setColor(0xffd700);

    await interaction.reply({ embeds: [embed] });

    try {
      const winner = await interaction.client.users.fetch(winnerId);
      await winner.send(
        `🎉 You won the control-link raffle in **${interaction.guild?.name}**!\n${link.url}`,
      );
    } catch {
      await interaction.followUp({
        content: `Could not DM <@${winnerId}> — they may have DMs disabled. Share the link with them directly:\n${link.url}`,
        ephemeral: true,
      });
    }
  },
};

export const controlLinkButtons: ButtonHandler[] = [joinRaffleHandler, endRaffleHandler];
