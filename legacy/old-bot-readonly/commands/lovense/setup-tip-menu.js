const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');


const { getDataFromDB } = require('../../structures/sql/Pool.js');
 let toycontrolpanel;
 let row1;
 let row2;
 let row3;
 let row4;
 let row5;

 module.exports = {
	data: new SlashCommandBuilder()
	  .setName('setup-tip-menu')
	  .setDescription('Setup the tip menu')
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {

        toycontrolpanel = new EmbedBuilder();
        toycontrolpanel.setTitle(`Performer Dashboard: Tip Play`);
        toycontrolpanel.setDescription(`This panel gives you an overview about your`);
        //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
        //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
        //.addField('Default level', lovenseConfig.toy_default_level, true)



        toycontrolpanel.addFields({name: 'Solo Gangbang', value: `Only you will get controlled by many.`, inline: true});
        toycontrolpanel.addFields({name: 'Group Orgy', value: `Starting an orgy, other members can join to get controlled by many`, inline: true});
        toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
        toycontrolpanel.addFields({name: 'Solo Tip Play', value: `Tip based, like the cam site you visited last night, but for free.`, inline: true});
        toycontrolpanel.addFields({name: 'Group Tip Orgy', value: `Tip based orgy, tips will be splitted among controlled members.`, inline: true});
        //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
        toycontrolpanel.setColor('#02e3f3');
        toycontrolpanel.setFooter({text: `Last updated:`});
        toycontrolpanel.setTimestamp();
    

        row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('homePanel')
                .setLabel('Dashboard'),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanel')
                .setLabel('Tip Play'),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanel')
                .setLabel('Vote Play'),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('linkPlayPanel')
                .setLabel('Link Play'),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanel')
                .setLabel('Subscription Panel'),
        )


                //Tip Play Pannel Button Submenu
                row2 = new ActionRowBuilder()
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


                
                row3 = new ActionRowBuilder()
                .addComponents( new StringSelectMenuBuilder()
                .setCustomId('level')
                .setPlaceholder('Select the tip level you want to edit')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Level 1')
                        .setDescription('The dual-type Grass/Poison Seed Pokémon.')
                        .setValue('level1'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Level 2')
                        .setDescription('The Fire-type Lizard Pokémon.')
                        .setValue('level2'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Level 3')
                        .setDescription('The Water-type Tiny Turtle Pokémon.')
                        .setValue('level3'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Level 4')
                        .setDescription('The Water-type Tiny Turtle Pokémon.')
                        .setValue('level4'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Level 5')
                        .setDescription('The Water-type Tiny Turtle Pokémon.')
                        .setValue('level5'),
                )
                );
                row4 = new ActionRowBuilder()
                .addComponents( new StringSelectMenuBuilder()
                .setCustomId('time')
                .setPlaceholder('Select the reaction time in seconds')
                .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('1 Second')
                    .setValue('time1sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2 Seconds')
                    .setValue('time2sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('3 Seconds')
                    .setValue('time3sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('4 Seconds')
                    .setValue('time4sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('5 Seconds')
                    .setValue('time5sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('10 Seconds')
                    .setValue('time10sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('15 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time15sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('20 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time20sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('25 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time25sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('30 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time30sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('35 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time35sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('40 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time40sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('45 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time45sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('50 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time50sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('55 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time55sec'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('60 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time60sec'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('70 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time70sec'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('80 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time80sec'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('90 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time90sec'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('100 Seconds')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('time100sec'),
                )
                );
                row5 = new ActionRowBuilder()
                .addComponents( new StringSelectMenuBuilder()
                .setCustomId('power')
                .setPlaceholder('select the vibration power')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Low')
                    .setDescription('The dual-type Grass/Poison Seed Pokémon.')
                    .setValue('bulbasaur'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Medium')
                    .setDescription('The Fire-type Lizard Pokémon.')
                    .setValue('charmander'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('High')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('squirtle'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Ultra High')
                    .setDescription('The Water-type Tiny Turtle Pokémon.')
                    .setValue('ultrahigh'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Wave')
                    .setDescription('∿∿∿∿')
                    .setValue('wave'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Pulse')
                    .setDescription('⨅⨆⨅⨆')
                    .setValue('pulse'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Earthquake')
                    .setDescription('/|/|/|/|')
                    .setValue('earthquake'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Fireworks')
                    .setDescription('𝆱|𝆱|𝆱|')
                    .setValue('fireworks'),
                )
                );
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1, row2, row3, row4, row5]});

	}
};