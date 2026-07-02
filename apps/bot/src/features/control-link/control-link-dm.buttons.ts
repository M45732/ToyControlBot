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
import { postRaffleEmbed, requireRaffleTarget } from "./control-link.service.js";
import {
  buildAnonymousChoiceEmbed,
  buildMessageStepEmbed,
  buildSentEmbed,
  readWizardState,
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

/** Re-derive wizard state (link, anonymous flag, message) from the bot's own wizard message. */
function requireWizardState(interaction: ButtonInteraction) {
  const state = readWizardState(interaction.message.embeds[0] ?? null);
  if (!state) {
    throw new UserFacingError("This raffle link expired or is no longer valid. Send it again.");
  }
  return state;
}

/**
 * In-flight "Start Raffle" clicks, keyed by wizard message id. Guards against
 * a double-click (or two clients) posting the same link as two separate
 * public raffles before the first click's `editReply` clears the button.
 * Safe because the has()+add() pair runs without an await between them, so
 * it is atomic within Node's single-threaded event loop (same pattern as the
 * subscribe flow).
 */
const pendingRaffleStarts = new Set<string>();

const startHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}start`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const { link } = requireWizardState(interaction);

    // Ack first, then do the REST-backed target/access checks — a cache miss
    // on either could otherwise blow Discord's 3-second ack window and make
    // the click silently fail (interaction.update() throwing "Unknown
    // interaction" with no working fallback response).
    await interaction.deferUpdate();

    const target = await requireRaffleTarget(interaction.client, interaction.user.id);

    await interaction.editReply({
      embeds: [buildAnonymousChoiceEmbed(link)],
      components: [anonymousChoiceRow()],
    });
  },
};

const anonymityHandler: ButtonHandler = {
  matches: (customId) => customId === `${PREFIX}anon` || customId === `${PREFIX}reveal`,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const { link } = requireWizardState(interaction);
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
    const { message: currentMessage } = requireWizardState(interaction);

    const input = new TextInputBuilder()
      .setCustomId("message-text")
      .setLabel("Please enter your message:")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setRequired(false);
    if (currentMessage) {
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
    const wizardKey = interaction.message.id;
    if (pendingRaffleStarts.has(wizardKey)) {
      throw new UserFacingError("Already posting this raffle — hang tight.");
    }
    pendingRaffleStarts.add(wizardKey);

    // Only released on a failure *before* the raffle is actually posted. If
    // postRaffleEmbed succeeds but the trailing editReply (clearing the
    // button) fails, the guard must stay held — otherwise a stale click on
    // the still-visible button would post a second, duplicate raffle for
    // the same link.
    let posted = false;
    try {
      const { link, anonymous, message } = requireWizardState(interaction);

      await interaction.deferUpdate();

      const target = await requireRaffleTarget(interaction.client, interaction.user.id);

      await postRaffleEmbed(target.channel, interaction.user.id, target.guild.id, target.channel.id, link, {
        anonymous,
        message,
      });
      posted = true;

      await interaction.editReply({
        embeds: [buildSentEmbed(target.channel.id)],
        components: [],
      });
    } finally {
      if (!posted) {
        pendingRaffleStarts.delete(wizardKey);
      }
    }
  },
};

export const controlLinkDmButtons: ButtonHandler[] = [
  startHandler,
  anonymityHandler,
  addMessageHandler,
  startRaffleHandler,
];
