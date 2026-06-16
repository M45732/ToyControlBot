const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-member-dashboard')
        .setDescription('Setup the Member Dashboard')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
        async execute(interaction) {


        const tokenpanel = new EmbedBuilder();
        tokenpanel.setTitle(`Member Dashboard`);
        tokenpanel.setDescription(`This is where you can get tokens, check your token balance and history.\nYou can also manage your active subscriptions and check your subscription history.`);
        //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
        //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
        //.addField('Default level', lovenseConfig.toy_default_level, true)

        tokenpanel.addFields({name: 'Get Tokens', value: `Shows ho to get tokens`, inline: true});
        tokenpanel.addFields({name: 'Token Balance', value: `Shows your token balance`, inline: true});
        tokenpanel.addFields({name: 'Token History', value: `Shows your token history`, inline: true});
        tokenpanel.addFields({name: 'Active Subscriptions', value: `Shows your active Subscriptions and gives you the option to cancel them`, inline: true});
        tokenpanel.addFields({name: 'Subscriptions History', value: `Displys the history of your past Subscriptions`, inline: true});
        //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
        tokenpanel.setColor('#02e3f3');
        tokenpanel.setFooter({text: `Dashboard version:`});
        tokenpanel.setTimestamp();
 
        let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tokenBuyPanel')
                .setLabel('💰 Get Token')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tokenBalancePanel')
                .setLabel('📈 Token Balance')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tokenHistoryPanel')
                .setLabel('📆 Token History')
                .setStyle(ButtonStyle.Secondary),
        );
        let row2 = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionsActivePanel')
                    .setLabel('💌 Active Subscriptions')
                    .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionsHistoryPanel')
                .setLabel('📆 Subscriptions History')
                .setStyle(ButtonStyle.Secondary),
        );

        await interaction.channel.send({embeds: [tokenpanel], components: [row, row2]});

	}
};