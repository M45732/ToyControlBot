const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const logger = require('../../util/Logger');
module.exports = {
	data: new SlashCommandBuilder()
	  .setName("restart")
	  .setDescription("Restarts the bot")
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			let currenttime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: false, timeZone:'UTC' });
			await interaction.reply({content: `${currenttime} - Restarting... Keep calm and wait.`, ephemeral: true});
			//const message = await interaction.channel.send("Restarting... Keep calm and wait.");
			process.exit(0);
		} catch (err) {
			logger.error(`(command::restart) Restart error: ${err}`);
		}
	}
};