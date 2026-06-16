const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('help')
	  .setDescription('Displays a list of available commands, or detailed information for a specific command.')
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	  .addStringOption(option =>
		option.setName('command')
			.setDescription('Wich command would you like to view the help for?')),
            
	async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const commands = interaction.client.commands.map(({execute, ...data }) => data);
        const command = commands.find(x => x.name === commandName);
        const result = {};
        for(const {name, description, group, format} of commands) {
            if(!result[group]) result[group] = [];
            result[group].push({name, description, format});
        }
        const output = Object.entries(result).map(([name, data]) => ({ name, data }));
        
        if(!commandName){
            const embed = new EmbedBuilder()
                .setTitle('Command List')
                .setColor(0x00AE86)
                .setFooter({text: `${commands.length} Commands`}); 
            for(const items of output) {
                embed.addFields(
                    `❯ ${items.name}`,
                    items.data.map(cmd => `\`${cmd.name}\``).join(', ') || 'None'
                );
            }

            await interaction.reply({embeds: [embed], ephemeral: true});
            /*
            // Send it as DM
            try {
                interaction.user.send({ embeds: [embed]});
                interaction.reply(`📬 Sent you a DM with information.`);
            } catch(error){
                interaction.reply(`Failed to send DM. You probably have DMs disabled`);
            }
            */
        }
        if(command){
            return interaction.reply({content: stripIndents`
            __Command **${command.name}**__
            ${command.description}

            **Format:**  ${command.format}
            **Group:** ${command.group}`, ephemeral: true});
        }
	},
};