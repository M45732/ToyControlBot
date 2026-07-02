import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
} from "discord.js";

import type { ButtonHandler } from "../../buttons/types.js";
import { UserFacingError } from "../../lib/errors.js";
import { detectControlLink, postRaffleEmbed, resolveRaffleChannel } from "./control-link.service.js";
import {
  buildAnonymousChoiceEmbed,
  buildMessageStepEmbed,
  buildSentEmbed,
  readLinkFromEmbed,
} from "./control-link-dm.service.js";

/**
 * customId prefix for the shared "anonymous / message / start raffle" wizard.
 * Entered either from a DM'd link (`control-link-dm.message.ts`) or from
 * `/control-link-raffle` (`control-link.commands.ts`) — both land on the same
 * steps below, since the wizard only reads state back from the message's
 * embed fields and doesn't care how it was started.
 */
export const PREFIX = "control-link-raffle:";

export function anonymousChoiceRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PREFIX}anon`)
      .setLabel("Stay Anonymous")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✅"),
    new ButtonBuilder()
      .setCustomId(`${PREFIX}reveal`)
      .setLabel("Reveal My Profile")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("❌"),
  );
}

export function messageStepRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PREFIX}start-raffle`)
      .setLabel("Start Raffle")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✅"),
    new ButtonBuilder()
      .setCustomId(`${PREFIX}add-message`)
      .setLabel("Add/Edit Message")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("➕"),
  );
}

/** Re-derive the parsed link (with provider) from the raw URL stored in the wizard embed. */
function requireLink(interaction: ButtonInteraction) {
  const url = readLinkFromEmbed(interaction.message.embeds[0] ?? null);
  const link = url ? detectControlLink(url) : null;
  if (!link) {
    throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
  }
  return link;
}

function fieldValue(interaction: ButtonInteraction, name: string): string | undefined {
  return interaction.message.embeds[0]?.fields.find((field) => field.name === name)?.value;
}

const startHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}start`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const link = requireLink(interaction);

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

    await interaction.update({
      embeds: [buildAnonymousChoiceEmbed(link)],
      components: [anonymousChoiceRow()],
    });
  },
};

const anonymityHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}anon` || customId === `${PREFIX}reveal`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const link = requireLink(interaction);
    const anonymous = interaction.customId === `${PREFIX}anon`;

    await interaction.update({
      embeds: [buildMessageStepEmbed(link, anonymous, "")],
      components: [messageStepRow()],
    });
  },
};

const addMessageHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}add-message`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const currentMessage = fieldValue(interaction, "Message");

    const input = new TextInputBuilder()
      .setCustomId("message-text")
      .setLabel("Please enter your message:")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setRequired(false);
    if (currentMessage && currentMessage !== "-") {
      input.setValue(currentMessage);
    }

    const modal = new ModalBuilder()
      .setCustomId(`${PREFIX}message-modal`)
      .setTitle("What do you want me to say?")
      .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
  },
};

const startRaffleHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}start-raffle`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const link = requireLink(interaction);
    const anonymous = fieldValue(interaction, "Anonymous") === "yes";
    const message = fieldValue(interaction, "Message");

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

    await interaction.deferUpdate();

    await postRaffleEmbed(target.channel, interaction.user.id, target.guild.id, target.channel.id, link, {
      anonymous,
      message: message && message !== "-" ? message : undefined,
    });

    await interaction.editReply({
      embeds: [buildSentEmbed(target.channel.id)],
      components: [],
    });
  },
};

export const controlLinkDmButtons: ButtonHandler[] = [
  startHandler,
  anonymityHandler,
  addMessageHandler,
  startRaffleHandler,
];
