const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const {CHAN_ID_GANGBANG, CHAN_ID_ORGY} = process.env;

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('setup-performer-dashboard')
	  .setDescription('Setup the Performer Dashboard')
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {

        const toycontrolpanel = new EmbedBuilder();
        toycontrolpanel.setTitle(`Performer Dashboard`);
        toycontrolpanel.setDescription(`THIS DASHBOARD IS **ONLY FOR MEMBERS WHO WANT TO GET CONTROLLED**
        This feature is still in development and will change over time or might be down every now and then!

        You will find ongoing orgy sessions in here: <#${CHAN_ID_ORGY}>, feel free to join them. Otherwise if you want to get controlled in a new session, start one with the buttons below.
        
        **How does the control work?**
        To control the orgy, simply react to a message with then reactions from 1-5 for the matching power level.
        The vote counting takes place every 5 seconds.
        After 60 seconds all votes get resetted to prevent member from voting and leaving (aka stuck votes/vibes).
        
        **How does the tip play work?**
        The tip play is based on the cam site you visited last night, but free. 
        (Use the /daily-free-token command to get free token.)

        And now, have fun vibing together 💦`);
        //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
        //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
        //.addField('Default level', lovenseConfig.toy_default_level, true)

/*

It's orgy time!
⚠ The orgy command is still in development and will change over time or might be  down every now and then ⚠

You will find ongoing orgy sessions in here or can start your own. If this channel is empty, start a new orgy with the command /toycontrol vote

How does the control work?
To control the orgy, simply react to a message with then reactions from 1-5 for the matching power level.

The vote counting takes place every 5 seconds.
After 60 seconds all votes get resetted to prevent member from voting and leaving aka stuck votes.

Have fun vibing together and get dirty in here.
xoxo your Vibiana

*/

        toycontrolpanel.addFields({name: 'Solo Gangbang', value: `Only you will get controlled by many.`, inline: true});
        toycontrolpanel.addFields({name: 'Group Orgy', value: `Starting an orgy, other members can join to get controlled by many`, inline: true});
        toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
        toycontrolpanel.addFields({name: 'Solo Tip Play', value: `Tip based, like the cam site you visited last night, but for free.`, inline: true});
        toycontrolpanel.addFields({name: 'Group Tip Orgy', value: `Tip based orgy, tips will be splitted among controlled members.`, inline: true});
        //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
        toycontrolpanel.setColor('#02e3f3');
        toycontrolpanel.setFooter({text: `Last updated:`});
        toycontrolpanel.setTimestamp();
 
        //let overviewButton = "Success";

        let mainPanelButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('overview')
                .setLabel('Overview')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanel')
                .setLabel('Tip Play')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanel')
                .setLabel('Vote Play')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('linkPlayPanel')
                .setLabel('Link Play')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanel')
                .setLabel('Subscriptions')
                .setStyle(ButtonStyle.Secondary),
        );

        //Tip Play Pannel Button Submenu
        let tipPlayPanelButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanelButtonStart')
                .setLabel('Start Tip Play Session')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanelButtonTipMenuSetup')
                .setLabel('Tip Menu Setup')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanelButtonToplist')
                .setLabel('Tip Toplist')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanelButtonHistory')
                .setLabel('Tip History')
                .setStyle(ButtonStyle.Secondary),
        );

        //Tip Play Pannel Button Submenu
        let votePlayPanelButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanelButtonStart')
                .setLabel('Start Tip Play Session')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanelButtonTipMenuSetup')
                .setLabel('Tip Menu Setup')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanelButtonToplist')
                .setLabel('Tip Toplist')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanelButtonHistory')
                .setLabel('Tip History')
                .setStyle(ButtonStyle.Secondary),
        );

        //Tip Play Pannel Button Submenu
        let linkPlayPanelButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('linkPlayPanelButtonAnonymous')
                .setLabel('Start Tip Play Session')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('linkPlayPanelButtonReveal')
                .setLabel('Tip Menu Setup')
                .setStyle(ButtonStyle.Secondary),
        );

        //Tip Subscription Pannel Button Submenu
        let subscriptionPanelButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanelButtonOverview')
                .setLabel('Subscription Overview')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanelButtonSetup')
                .setLabel('Subscription Setup')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanelButtonMemberlist')
                .setLabel('Subscription Memberlist')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanelButtonHistory')
                .setLabel('Subscription History')
                .setStyle(ButtonStyle.Secondary),
        );


        
        let row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('startGangbang')
                .setLabel('🤤 Start Solo Gangbang (Text)')
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('startOrgy')
                .setLabel('💦 Start Group Orgy (Text)')
                .setStyle(ButtonStyle.Secondary),
        );



        /*
        .addComponents(
                new ButtonBuilder()
                    .setCustomId('startTipOrgy')
                    .setLabel('💰 Start Group Tip Orgy (Cam/Voice)')
                    .setStyle(ButtonStyle.Secondary),
        );
        */


        await interaction.channel.send({embeds: [toycontrolpanel], components: [mainPanelButtons, tipPlayPanelButtons, votePlayPanelButtons, linkPlayPanelButtons, subscriptionPanelButtons]});


	}
};