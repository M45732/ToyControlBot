const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');

let option = option =>
    option.setName('type')
        .setDescription('The gif category')
        .setRequired(false)
        .addChoices(
            { name: 'active', value: 'active' },
            { name: 'history', value: 'history' },
        );

module.exports = {
	data: new SlashCommandBuilder()
        .setName('subscriptions')
        .setDescription('Check your subscriptions')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option),

	async execute(interaction) {
		await interaction.reply({ content: 'You have the following active subscriptions', ephemeral: true });

        //Model:
        //costs:
        //Link to thread:
        //Valid until: 2023-04-01 - (YYYY-MM-DD)
        //Auto renew: Yes
        //Renewal costs: 1000 tokens
        //Renewal link: https://discord.com/channels/1234567890/1234567890/1234567890
        //Renewal valid until: 2023-04-01 - (YYYY-MM-DD)

        //get the current subscriptions from the database
        let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_id FROM toycontrol WHERE discord_message_id='${interaction.applicationId}'`;
        let query_sessions = await getDataFromDB(query);
        let subscriptions = query_sessions[0];

        

        /*
		//sql: if member is alreay in other session
		let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_message_id='${interaction.applicationId}'`;
		let query_sessions = await getDataFromDB(query);
		let session = query_sessions[0];

        */


	}
};