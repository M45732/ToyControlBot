const { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const commandName = 'toycontrol';
const LovenseConnect = require('../../util/LovenseConnect');
const { LovenseConnect_send, LovenseConnect_getQrCode, LovenseConnect_GetConnectedToys, LovenseConnect_logout} = require('../../util/LovenseConnect');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { parseTwoDigitYear } = require('moment');
let config='';
require('dotenv').config();
const {DEV, CHART_LINK, CHAN_ID_ORGY} = process.env;
//const { Profile_Link } = process.env;
/*

Orgy(only by admins? always active? )

Type: Solo / (Group) / Orgy
Privacy: Public / Private
Mode: ReactionVote / Tip(only in solo)


Public:


Private:


*/



const optionsGangbang = [
	/*
	{
    name: 'mode',
    type: ApplicationCommandOptionType.String,
    description: 'Gangbang=You / Orgy=Group gets controlled',
    required: false,
    choices: [
		{
            name: 'solo-gangbang',
            value: `solo-gangbang`,
        },
		{
            name: 'orgy',
            value: `orgy`,
        },
        {
            name: 'anonymous',
            value: `anonymous`,
        },

    ]
},*/
/*{
    name: 'privacy',
    type: ApplicationCommandOptionType.String,
    description: 'Public or Private(invite only)?',
    required: false,
    choices: [
		{
            name: 'public',
            value: `public`,
        },/*
        //{
        //    name: 'anonymous',
        //    value: `anonymous`,
        //},
        {
            name: 'private',
            value: `private`,
        }
    ]
},*/
{
    name: 'message',
    type: ApplicationCommandOptionType.String,
	maxlength: 2000,
    description: 'which message would you like to send?'
}];
	
const optionsOrgy = [
	/*
	{
    name: 'mode',
    type: ApplicationCommandOptionType.String,
    description: 'Gangbang=You / Orgy=Group gets controlled',
    required: false,
    choices: [
		{
            name: 'highest-vote',
            value: `highest-vote`,
        },
		{
            name: 'orgy',
            value: `orgy`,
        },
        {
            name: 'anonymous',
            value: `anonymous`,
        },

    ]
},*/
{
    name: 'privacy',
    type: ApplicationCommandOptionType.String,
    description: 'Public or Private(invite only)?',
    required: false,
    choices: [
		{
            name: 'public',
            value: `public`,
        },
        //{
        //    name: 'anonymous',
        //    value: `anonymous`,
        //},
        {
            name: 'private',
            value: `private`,
        }
    ]
},
{
    name: 'message',
    type: ApplicationCommandOptionType.String,
	maxlength: 2000,
    description: 'which message would you like to send?'
}];

const optionsTip = [{
    name: 'message',
    type: ApplicationCommandOptionType.String,
	maxlength: 2000,
    description: '(Optional) Session description'
}];

module.exports = {

	name: commandName,
	group: 'lovense',
	description: `Select your play mode`,
	format: `/${commandName}`,
	options: [
			{ //adding support for control links? (integrate lovenselinkplay)
				name: 'gangbang',
				type: ApplicationCommandOptionType.Subcommand,
				value: `gangbang`,
				description: 'Start an Gangbang (you get controlled by many)',
				options: optionsGangbang,
			},
			{
				//'Creates a vote session (only you and members you invite get controlled)'
				//Create a orgy session (anyone can join to get controlled)
				name: 'orgy',
				type: ApplicationCommandOptionType.Subcommand,
				value: `orgy`,
				description: 'Start a Gangbang (many get controlled by many)',
				options: optionsOrgy,
			},
			{
				name: 'tip',
				type: ApplicationCommandOptionType.Subcommand,
				value: `tip`,
				description: 'Token / Tip based (like cam sites)',
				options: optionsTip,
			},
			/*{
				name: 'botplay',
				type: ApplicationCommandOptionType.Subcommand,
				value: `botplay`,
				description: 'This will create a private session controlled by our AIs Vibiana & Vibiano.',
			},*/
		],
		
	

/**
		static delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
	
*/
	//start session
	async execute(interaction) {
		await interaction.reply({ content: 'Starting play session... please wait...', ephemeral: true });

		let join = false;
		//Lovense_create_qr_embed(interaction, join);

		const filter = i => i.customId === 'lovenselogin' || i.customId === 'lovenseleave' || i.customId === 'lovensestay';
		const collector = interaction.channel.createMessageComponentCollector({ filter });

		collector.on('collect', async (i) => {
			if(i.customId === "lovenseleave") {
				//Lovense_delete_member_session(interaction);
				//Lovense_Start_session(interaction, i);
			} 
			if(i.customId === "lovensestay") {
				interaction.deleteReply();
			}
			if(i.customId === "lovenselogin") {
				//Lovense_Start_session(interaction, i);
			}
			collector.stop();
		})		
	}
};


