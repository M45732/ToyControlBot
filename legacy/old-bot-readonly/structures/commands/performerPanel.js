const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const {CHAN_ID_GANGBANG, CHAN_ID_ORGY} = process.env;

const select_performer_panel = async (interaction ) => {

    let toycontrolpanel;
    let row1;
    let row2;
    let row3;
    let row4;
    let row5;
    let rowcounter = 1;
    let homePanelButtonStatus = ButtonStyle.Primary;
    let tipPlayPanelButtonStatus = ButtonStyle.Primary;
    let votePlayPanelButtonStatus = ButtonStyle.Primary;
    let linkPlayPanelButtonStatus = ButtonStyle.Primary;
    let subscriptionPanelButtonStatus = ButtonStyle.Primary;

    let modal
    let tokenInput
    let titleInput
    let descriptionInput
    let firstActionRow
    let secondActionRow
    let thirdActionRow
    let fourthActionRow
    let select
    let anonymousInput

    switch(interaction.customId){
        case "homePanel":
            homePanelButtonStatus = ButtonStyle.Success;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Home`);
            toycontrolpanel.setDescription(`This panel gives you an overview about your`);
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

            toycontrolpanel.addFields({name: 'Tip Play', value: `This mode is a token based tip control. Start a new Tip Play session alone or with friends. Setup your Tip Menu and check your statistics.`, inline: true});
            toycontrolpanel.addFields({name: 'Vote Play', value: `Starting an orgy, other members can join to get controlled by many`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Link Play', value: `Share a control link with this bot and it will start a raffle to pick a controler. `, inline: true});
            toycontrolpanel.addFields({name: 'Subscriptions', value: `This section is about your subscribers and premium channel. `, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();
            break;

        case "tipPlayPanel": 
            tipPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Tip Play`);
            toycontrolpanel.setDescription(`This panel gives you an overview about your`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)



            toycontrolpanel.addFields({name: 'Start Tip Play', value: `This starts a new Tip Play session.`, inline: true});
            toycontrolpanel.addFields({name: 'Tip Menu Setup', value: `Starting an orgy, other members can join to get controlled by many`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Tip Toplist', value: `Tip based, like the cam site you visited last night, but for free.`, inline: true});
            toycontrolpanel.addFields({name: 'Tip History', value: `Tip based orgy, tips will be splitted among controlled members.`, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();


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
            break;
        
        case "tipPlayPanelButtonTipMenuSetup":
            tipPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 5;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Tip Play`);
            toycontrolpanel.setDescription(`This panel gives you an overview about your`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)
    
            
            
            
            
    
            toycontrolpanel.addFields({name: 'Tip Play', value: `This mode is a token based tip control. Start a new Tip Play session alone or with friends. Setup your Tip Menu and check your statistics.`, inline: true});
            toycontrolpanel.addFields({name: 'Vote Play', value: `Starting an orgy, other members can join to get controlled by many`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Link Play', value: `Share a control link with this bot and it will start a raffle to pick a controler. `, inline: true});
            toycontrolpanel.addFields({name: 'Subscriptions', value: `This section is about your subscribers and premium channel. `, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();
    
    
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

            break;

        case "tipPlayPanelButtonToplist":
            tipPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Tip Toplist`);
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
            break;

        case "tipPlayPanelButtonHistory":
            tipPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Tip History`);
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
            break;

        case "votePlayPanel": 
            votePlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Vote Play`);
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

            //Vote Play Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('votePlayPanelButtonStart')
                    .setLabel('Start Vote Play Session')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('votePlayPanelButtonTipMenuSetup')
                    .setLabel('Join Vote Play Orgy')
                    .setStyle(ButtonStyle.Secondary),
            );
        
            break;

        case "linkPlayPanel": 
            linkPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Link Play`);
            toycontrolpanel.setDescription(`This Dashboard gives you an overview about our different Link Play modes. You can share any control link to the bot and it will start an auction or a raffle.`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)

            toycontrolpanel.addFields({name: 'Link Auction', value: `You share a link and the bot will start an auction. The highest bidder will get the link. You have the option to stay anonymous or reveal your profile. `, inline: true});
            toycontrolpanel.addFields({name: 'Link Raffle', value: `You share a link and the bot will start a raffle. The winner of the raffle will be picked randomly and get the link. You can optional charge a fixed fee for entering the raffle. You have the option to stay anonymous or reveal your profile.`, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();

            //Link Play Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonAnonymous')
                    .setLabel('Link Auction')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonReveal')
                    .setLabel('Link Raffle')
                    .setStyle(ButtonStyle.Secondary),
            );
        break;

        case "linkPlayPanelButtonAnonymous": 
            linkPlayPanelButtonStatus = ButtonStyle.Success;

            modal = new ModalBuilder()
			.setCustomId('linkPlayAnonymousModal')
			.setTitle('Link Auction');

		// Add components to modal

		// Create the text input components
        titleInput = new TextInputBuilder()
			.setCustomId('titleInput')
            // The label is the prompt the user sees for this input
			.setLabel("Enter your control link.")
            //We support Lovense, Handy and xtoys. F.e. '[Nora] [F4A] https://lovense.com/c/qwertyuiop'
            // set a placeholder string to prompt the user
            .setPlaceholder('F.e. [Nora] [F4A] https://lovense.com/c/qwertyuiop')
            // Short means only a single line of text
			.setStyle(TextInputStyle.Short)
            // require a value in this input field
            .setRequired(true);



        anonymousInput = new TextInputBuilder()
			.setCustomId('anonymousInput')
            // The label is the prompt the user sees for this input
			.setLabel("Do you want to stay anonymous? Type:Yes/No")
            // Short means only a single line of text
			.setStyle(TextInputStyle.Short)
            // set a placeholder string to prompt the user
            .setPlaceholder('Default: No - Allowed: Yes / No')
            // set a default value to pre-fill the input
            //.setValue('No')
            //.setMinLength(2)
            // set a placeholder string to prompt the user
            // set the maximum number of characters to allow
            .setMaxLength(3)
            // require a value in this input field
            .setRequired(false);

        descriptionInput = new TextInputBuilder()
			.setCustomId('descriptionInput')
			.setLabel("(Optional) Add a description for your link:")
            // F.e. 'Control my toy and make me cum'
            // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph)
            // require a value in this input field
            .setRequired(false);

            
        tokenInput = new TextInputBuilder()
			.setCustomId('tokenInput')
            // The label is the prompt the user sees for this input
			.setLabel("Enter the starting bid for the auction:")
            // set a placeholder string to prompt the user
            .setPlaceholder('(Optional) Default: 1')
            // Short means only a single line of text
			.setStyle(TextInputStyle.Short)
            // require a value in this input field
            .setRequired(false);
            

		// An action row only holds one text input,
		// so you need one action row per text input.
		firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        secondActionRow = new ActionRowBuilder().addComponents(anonymousInput);
        thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);
        fourthActionRow  = new ActionRowBuilder().addComponents(tokenInput);
		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);

            //Link Play Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonAnonymous')
                    .setLabel('Link Auction')
                    .setStyle(ButtonStyle.Success),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonReveal')
                    .setLabel('Link Raffle')
                    .setStyle(ButtonStyle.Secondary),
            );
        break;

        case "linkPlayPanelButtonReveal":
            linkPlayPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            modal = new ModalBuilder()
            .setCustomId('linkPlayRevealModal')
            .setTitle('Public Link Play');

        // Add components to modal

        // Create the text input components
        titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            // The label is the prompt the user sees for this input
            .setLabel("Enter your control link.") 
            //We support Lovense, Handy and xtoys. F.e. '[Nora] [F4A] https://lovense.com/c/qwertyuiop'
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);

        descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel("(Optional) Add a description for your link.")
            // F.e. 'Control my toy and make me cum'
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);

        tokenInput = new TextInputBuilder()
            .setCustomId('tokenInput')
            // The label is the prompt the user sees for this input
            .setLabel("How many token do you want to charge?")
            // (Optional) We suggest 0-50
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
            
        // An action row only holds one text input,
        // so you need one action row per text input.
        firstActionRow = new ActionRowBuilder().addComponents(tokenInput);
        secondActionRow = new ActionRowBuilder().addComponents(titleInput);
        thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);

            //Link Play Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonAnonymous')
                    .setLabel('Link Auction')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('linkPlayPanelButtonReveal')
                    .setLabel('Public Link Play')
                    .setStyle(ButtonStyle.Success),
            );
        break;

        case "subscriptionPanel":
            subscriptionPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Subscriptions`);
            toycontrolpanel.setDescription(`This panel gives you an overview about the different play options:`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)
    
    
    
            toycontrolpanel.addFields({name: 'Tip Play', value: `Tip based play, like on cam sites, but with the option for orgies.`, inline: true});
            toycontrolpanel.addFields({name: 'Vote Play', value: `Vote based play, let a group of members vote for your toy speed (No token for now)`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Link Play', value: `Link based play, you can send links anonymously or reveal your name. You have the option to charge token or send it for free. We add an auction feature later.`, inline: true});
            toycontrolpanel.addFields({name: 'Subscription Panel', value: `Here you can setup and manage your Subscriptions`, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();

            //Tip Subscription Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelOverview')
                    .setLabel('Subscription Overview')
                    .setStyle(ButtonStyle.Success),
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
                    .setLabel('Active Subscriber')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonHistory')
                    .setLabel('Subscriber History')
                    .setStyle(ButtonStyle.Secondary),
            );
            break;

        case "subscriptionPanelButtonSetup": 
            subscriptionPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Subscription Panel`);
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

            //Tip Subscription Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelOverview')
                    .setLabel('Subscription Overview')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonSetup')
                    .setLabel('Subscription Setup')
                    .setStyle(ButtonStyle.Success),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonMemberlist')
                    .setLabel('Active Subscriber')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonHistory')
                    .setLabel('Subscriber History')
                    .setStyle(ButtonStyle.Secondary),
            );

            // Create the modal
            modal = new ModalBuilder()
                .setCustomId('subscriptionSetupModal')
                .setTitle('Subscription Setup');

            // Add components to modal

            // Create the text input components
            tokenInput = new TextInputBuilder()
                .setCustomId('tokenInput')
                // The label is the prompt the user sees for this input
                .setLabel("Token price for monthly subscription")
                // set a placeholder string to prompt the user
                .setPlaceholder("We suggest to start with 100 tokens. Only enter numbers!")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Short);

            titleInput = new TextInputBuilder()
                .setCustomId('titleInput')
                // The label is the prompt the user sees for this input
                .setLabel("Subscription channel name")
                // set a placeholder string to prompt the user
                .setPlaceholder(`E.g. "Amon's Fanclub"`)
                // Short means only a single line of text
                .setStyle(TextInputStyle.Short);

            descriptionInput = new TextInputBuilder()
                .setCustomId('descriptionInput')
                .setLabel("Channel description")
                // set a placeholder string to prompt the user
                .setPlaceholder("Please descripe your channel and it's benefits. E.g. premium selfies, videos, play sessions...")
                // Paragraph means multiple lines of text.
                .setStyle(TextInputStyle.Paragraph);

            // An action row only holds one text input,
            // so you need one action row per text input.
            firstActionRow = new ActionRowBuilder().addComponents(tokenInput);
            secondActionRow = new ActionRowBuilder().addComponents(titleInput);
            thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);

            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            // Show the modal to the user
            await interaction.showModal(modal);

            break;

        case "subscriptionPanelButtonMemberlist":
            subscriptionPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Active Subscriber`);
            toycontrolpanel.setDescription(`This panel gives you an overview about the different play options:`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)
    
    
    
            toycontrolpanel.addFields({name: 'Active Subscriber', value: `X active subscriber`, inline: true});
            toycontrolpanel.addFields({name: 'Token income per month', value: `X tokens per month`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Change to last month', value: `+- X tokens`, inline: true});
            toycontrolpanel.addFields({name: 'Alltime subscriber count', value: `X different members`, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();

            //Tip Subscription Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelOverview')
                    .setLabel('Subscription Overview')
                    .setStyle(ButtonStyle.Success),
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
                    .setLabel('Active Subscriber')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonHistory')
                    .setLabel('Subscriber History')
                    .setStyle(ButtonStyle.Secondary),
            );
            break;

        case "subscriptionPanelButtonHistory":
            subscriptionPanelButtonStatus = ButtonStyle.Success;
            rowcounter = 2;

            toycontrolpanel = new EmbedBuilder();
            toycontrolpanel.setTitle(`Performer Dashboard: Subscription History`);
            toycontrolpanel.setDescription(`This panel gives you an overview about the different play options:`);
            //toycontrolpanel.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
            //lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
            //.addField('Default level', lovenseConfig.toy_default_level, true)
    
    
    
            toycontrolpanel.addFields({name: 'Tip Play', value: `Tip based play, like on cam sites, but with the option for orgies.`, inline: true});
            toycontrolpanel.addFields({name: 'Vote Play', value: `Vote based play, let a group of members vote for your toy speed (No token for now)`, inline: true});
            toycontrolpanel.addFields({name: '\u200b', value: '\u200b'});
            toycontrolpanel.addFields({name: 'Link Play', value: `Link based play, you can send links anonymously or reveal your name. You have the option to charge token or send it for free. We add an auction feature later.`, inline: true});
            toycontrolpanel.addFields({name: 'Subscription Panel', value: `Here you can setup and manage your Subscriptions`, inline: true});
            //toycontrolpanel.setImage('https://i.pinimg.com/originals/3d/80/64/3d8064758e54ec662e076b6ca54aa90e.gif')
            toycontrolpanel.setColor('#02e3f3');
            toycontrolpanel.setFooter({text: `Last updated:`});
            toycontrolpanel.setTimestamp();

            //Tip Subscription Pannel Button Submenu
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelOverview')
                    .setLabel('Subscription Overview')
                    .setStyle(ButtonStyle.Success),
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
                    .setLabel('Active Subscriber')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('subscriptionPanelButtonHistory')
                    .setLabel('Subscriber History')
                    .setStyle(ButtonStyle.Secondary),
            );
            break;

        default:
            row2 = new ActionRowBuilder()
        }

        row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('homePanel')
                .setLabel('Home')
                .setStyle(`${homePanelButtonStatus}`),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tipPlayPanel')
                .setLabel('Tip Play')
                .setStyle(`${tipPlayPanelButtonStatus}`),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('votePlayPanel')
                .setLabel('Vote Play')
                .setStyle(`${votePlayPanelButtonStatus}`),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('linkPlayPanel')
                .setLabel('Link Play')
                .setStyle(`${linkPlayPanelButtonStatus}`),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('subscriptionPanel')
                .setLabel('Subscriptions')
                .setStyle(`${subscriptionPanelButtonStatus}`),
        )
        
        /*
        .addComponents(
                new ButtonBuilder()
                    .setCustomId('startTipOrgy')
                    .setLabel('💰 Start Group Tip Orgy (Cam/Voice)')
                    .setStyle(ButtonStyle.Secondary),
        );
        */
        await interaction.deferUpdate();

        switch(rowcounter){
            case 1:
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1]});
                break;
            case 2:
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1, row2]});
                break;
            case 3:
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1, row2, row3]});
                break;
            case 4:
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1, row2, row3, row4]});
                break;
            case 5:
                await interaction.message.edit({embeds: [toycontrolpanel], components: [row1, row2, row3, row4, row5]});
                break;

        }

	};
module.exports.select_performer_panel = select_performer_panel