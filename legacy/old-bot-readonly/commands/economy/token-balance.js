const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');

let messagetype = option =>
    option.setName('messagetype')
        .setDescription('Do you want to send the message public or private?')
        .setRequired(false)
        .addChoices(
            { name: 'current', value: 'current' },
            { name: 'history', value: 'history' },
        )

module.exports = {
    data: new SlashCommandBuilder()
        .setName('token-balance')
        .setDescription('Check your current token balance or the full token history')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        //.addUserOption(option => option.setName('user').setDescription('Show the toplist place of the mentioned user').setRequired(false)),
        .addStringOption(messagetype),

	async execute(interaction) {

		//get the curren token balance from the database
		let query = `SELECT balance FROM token_balance WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}'`;
		let query_sessions = await getDataFromDB(query);
		let token = query_sessions[0].balance;

		await interaction.reply({ content: `Your account has ${token} token`, ephemeral: true });
	}
};