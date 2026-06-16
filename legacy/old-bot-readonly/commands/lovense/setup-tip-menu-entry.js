const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits  } = require('discord.js');
const { LovenseConnect_send_tip } = require('../../structures/commands/LovenseConnect.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
/*

Orgy(only by admins? always active? )

Type: Solo / (Group) / Orgy
Privacy: Public / Private
Mode: ReactionVote / Tip(only in solo)


Public:


Private:




const options = [
{
    name: 'min-tip',
    type: ApplicationCommandOptionType.Integer,
	maxlength: 5,
    description: 'Set the minimum tip amount for this level',
    required: true
},
{
    name: 'duration',
    type: ApplicationCommandOptionType.Integer,
	maxlength: 3,
    description: 'Set the duration in seconds',
    required: true
},
{
    name: 'intensity',
    type: ApplicationCommandOptionType.String,
    description: 'Do you want to send the message public or private?',
    required: true,
    choices: [
		{
            name: 'Low',
            value: `low`,
        },
        {
            name: 'Medium',
            value: `medium`,
        },
        {
            name: 'High',
            value: `high`,
        },
        {
            name: 'Ultra High',
            value: `ultrahigh`,
        }
    ]
}];

const options2 = [
{
    name: 'tip',
    type: ApplicationCommandOptionType.Integer,
	maxlength: 5,
    description: 'Set the minimum tip amount for this level',
    required: true
},
{
    name: 'duration',
    type: ApplicationCommandOptionType.Integer,
	maxlength: 3,
    description: '(Optional) Add a message',
    required: true
},
{
    name: 'pattern',
    type: ApplicationCommandOptionType.String,
    description: 'Do you want to send the message public or private?',
    required: true,
    choices: [
		{
            name: 'Earthquake /|/|/|/|',
            value: `earthquake`,
        },
        {
            name: 'Fireworks 𝆱|𝆱|𝆱|',
            value: `fireworks`,
        },
        {
            name: 'Pulse ⨅⨆⨅⨆⨅',
            value: `pulse`,
        },
        {
            name: 'Waves ∿∿∿∿',
            value: `waves`,
        }
    ]
}];
*/


/*
module.exports = {

	name: 'setup-tip-menu-entry',
	group: 'lovense',
	description: `Performer only: Setup tip menu`,
	format: `/${setup-tip-menu-entry}`,
    options: [
        {
			name: 'level-1',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Setup Level 1 Tip Menu, we suggest a minimum tip of 1`,
            options: options,
        },
        {
			name: 'level-2',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Care for someone`,
            options: options,
        },
        {
			name: 'level-3',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options,
        },
        {
			name: 'level-4',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options,
        },
        {
			name: 'level-5',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options,
        },
        {
			name: 'special-1',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Beg someone`,
            options: options2,
        },
        {
			name: 'special-2',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Care for someone`,
            options: options2,
        },
        {
			name: 'special-3',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options2,
        },
        {
			name: 'special-4',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options2,
        },
        {
			name: 'special-5',
            type: ApplicationCommandOptionType.Subcommand,
            description: `Cheer someone`,
            options: options2,
        },
    ],*/
    let options = option =>
        option.setName('level-1')
            .setDescription('Do you want to send the message public or private?')
            .setRequired(false)
            .addChoices(
                { name: 'Low', value: 'low' },
                { name: 'Medium', value: 'medium' },
                { name: 'Strong', value: 'strong' },
            )
            
    module.exports = {
        data: new SlashCommandBuilder()
          .setName('setup-tip-menu-entry')
          .setDescription('Performer only: Setup tip menu')
          .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
          .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
          //.addStringOption(messagetype)
          .addSubcommand(subcommand =>
            subcommand
                .setName('level-1')
                .setDescription('Setup Level 1 Tip Menu, we suggest a minimum tip of 1')
                .addStringOption(options)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('level-2')
                .setDescription('Setup Level 2 Tip Menu, we suggest a minimum tip of 2')
                .addStringOption(options)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('level-3')
                .setDescription('Setup Level 3 Tip Menu, we suggest a minimum tip of 3')
                .addStringOption(options)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('level-4')
                .setDescription('Setup Level 4 Tip Menu, we suggest a minimum tip of 4')
                .addStringOption(options)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('level-5')
                .setDescription('Setup Level 5 Tip Menu, we suggest a minimum tip of 5')
                .addStringOption(options)
        ),


	async execute(interaction) {

		let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_channel_id='${interaction.channel.id}' AND session_mode='tip'`;
		let query_sessions = await getDataFromDB(query);
        if (query_sessions.length == 0) {
            return interaction.reply({ content: `There is no active toy control session in this channel.`, ephemeral: true });
        }
		let session = query_sessions[0];

        if(!session.session_active) {
        //if the session is not active, send a message to the user and return
            return interaction.reply({ content: `You can only tip members in an ongoing toy control tip-session.`, ephemeral: true });
        }

        let tip = interaction.options.getString('token');
        let message = interaction.options.getString('message');
        let messagetype = interaction.options.getString('messagetype');
        //send the tip to the waitlist by updating the database

        //get the token balance of the user
		query = `SELECT balance FROM token_balance WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}'`;
		query_sessions = await getDataFromDB(query);
		let token = query_sessions[0].balance;
        let duration = 10;
        //if token balance is higher or equal to the tip amount, send the tip
        if (token >= tip) {
            //send the tip to the model
            LovenseConnect_send_tip(session.discord_user_ids, session.toy_speed, duration);
            //update the token balance in the database

            //add token history for sender
            let query = `INSERT INTO token_history (discord_guild_id, discord_user_id, discord_user_id_trigger, token_amount, event_type, event_id, timestamp) VALUES ( ${interaction.guild.id}, ${interaction.member.id}, ${session.discord_user_ids}, ${-tip}, 'tip_send', ${session.discord_message_id}, UTC_TIMESTAMP())`; //add entry to db
            await getDataFromDB(query); //await query

            for(let i = 0; i < session.discord_user_ids.length; i++) {

                //add token history for receiver
                let query2 = `INSERT INTO token_history (discord_guild_id, discord_user_id, discord_user_id_trigger, token_amount, event_type, event_id, timestamp) VALUES ( ${interaction.guild.id}, ${session.discord_user_ids} ,${interaction.member.id}, ${tip}, 'tip_received', ${session.discord_message_id}, UTC_TIMESTAMP())`; //add entry to db
                await getDataFromDB(query2); //await query

                //add tip history
                let query3 = `INSERT INTO toycontrol_tip_history (transaction_id, discord_message_id, discord_user_id_sender, discord_user_id_receiver, tip_message, split, token, queue, timestamp) VALUES ( ${interaction.guild.id}, ${interaction.member.id}, , 'tip message example','3',${tip}, '0', UTC_TIMESTAMP())`; //add entry to db
                await getDataFromDB(query3); //await query

            }

            //send a message to the user
            //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: true });

            //send a message to the model or public
            if (messagetype == 'public') {
                //send a message to the public chat
                await interaction.reply({ content: `${interaction.member.name} tipped ${tip} token.\n${message}`, ephemeral: false });
            }
            else if (messagetype == 'private') {
                //send a message to the model via whisper channel
                //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: false });
            }
            else if (messagetype == 'anonymous') {
                //send a public anonymous message 
                //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: true });
            }

        }
        else {
            await interaction.reply({ content: `You don't have enough token. Your token balance is ${token} and you tried to tip ${tip}`, ephemeral: true });
        }

	}
};