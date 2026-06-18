import { type ButtonInteraction, EmbedBuilder } from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { getRaffle, joinRaffle, pickWinner } from "./control-link.service.js";

const joinRaffleHandler: ButtonHandler = {
  matches(customId: string): boolean {
    return customId.startsWith("raffle:join:");
  },
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guildId) {
      throw new UserFacingError("This button can only be used inside a server.");
    }

    const raffleMessageId = interaction.customId.slice("raffle:join:".length);
    const joined = joinRaffle(raffleMessageId, interaction.user.id);
    const raffle = getRaffle(raffleMessageId);

    await interaction.reply({
      content: joined
        ? `You entered the raffle! (${raffle?.participants.size ?? 1} participant(s))`
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
    const raffle = getRaffle(raffleMessageId);

    if (!raffle) {
      throw new UserFacingError("This raffle has already ended.");
    }
    if (raffle.hostId !== interaction.user.id) {
      throw new UserFacingError("Only the raffle host can end it.");
    }

    const winnerId = pickWinner(raffleMessageId);
    if (!winnerId) {
      // Raffle stays active — reply privately so the public embed is untouched.
      await interaction.reply({ content: "No one has entered yet. The raffle is still open.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Raffle Winner!")
      .setDescription(`🎉 <@${winnerId}> won control of the link!`)
      .setColor(0xffd700);

    await interaction.reply({ embeds: [embed] });

    try {
      const winner = await interaction.client.users.fetch(winnerId);
      await winner.send(
        `🎉 You won the control-link raffle in **${interaction.guild?.name}**!\n${raffle.link.url}`,
      );
    } catch {
      await interaction.followUp({
        content: `Could not DM <@${winnerId}> — they may have DMs disabled. Share the link with them directly:\n${raffle.link.url}`,
        ephemeral: true,
      });
    }
  },
};

export const controlLinkButtons: ButtonHandler[] = [joinRaffleHandler, endRaffleHandler];
