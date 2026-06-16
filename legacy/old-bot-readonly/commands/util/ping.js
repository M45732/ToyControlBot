const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s ping to the Discord server.')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
        await interaction.reply('Pinging...');
        const message = await interaction.fetchReply();
        const ping = Math.round(message.createdTimestamp - await interaction.createdTimestamp);
        await interaction.editReply(stripIndents`
        ❤ H${'e'.repeat(Math.ceil(interaction.client.ws.ping / 100))}artbeat! \`${interaction.client.ws.ping}ms\`
        🏓 L${'a'.repeat(Math.ceil(ping / 100))}tency! \`${ping}ms\`
        `);
	},
};