require('dotenv').config();
const { CHAN_ID_ANON_CONTROL, CHAN_ID_TRUSTED_ANON } = process.env;
//const { Channel } = require('discord.js/src/util/Partials.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } = require('discord.js');
/**
 * Announces a guild member's no-ping connection status
 */

module.exports = async (channel, msg) => {
	console.log('DM', channel)
	if (!msg.channel) return null;
	if (msg.author.bot) return;
	// validate if we have an anon link and of course, a variable set to process it.

	if (msg.channel.type !== ChannelType.DM) return;
	if (msg.command !== undefined) return;

	console.log('DM2')

	/*
	if ((msg.content.toString().includes('.lovense.com/c/')) || (msg.content.toString().includes('.lovense.com/v2/')) || (msg.content.toString().includes('.lovense-api.com/v2/'))) {
		const lovenseLinks = require('../handlers/messageLovense.js'); 
		//Note: I think this is not longer used - but the messages doesn't get posted twice. should check it out
		lovenseLinks(msg.client.channels.cache.get(CHAN_ID_ANON_CONTROL), msg );
	}*/
	
	//https://c.lovense-api.com/v2/2z74cs
	//https://c.lovense-api.com/t2/2z74cs
	//https://handyfeeling.com/remote?inbof
	//https://xtoys.app/session/N6VQGTQM
	if ((msg.content.toString().includes('handyfeeling.com/remote?')) || (msg.content.toString().includes('xtoys.app/session/')) || (msg.content.toString().includes('.lovense-api.com/t2/')) || (msg.content.toString().includes('.lovense.com/c/'))) {
		//skip validation for now

		const chooseEmbed = new EmbedBuilder()
		.setTitle('Be aware that this link will be re-posted by me to the server')
		.setDescription(`Click the button to proceed`)
		.setColor('#00ffff')

		const row = new ActionRowBuilder()
		.addComponents(
		new ButtonBuilder()
			.setCustomId(`button_start_control_link`)
			.setLabel('Start')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('✅'),
		);

	await msg.channel.send({content: msg.content, embeds: [chooseEmbed], components: [row]});


	} else {
		return msg.reply(`Hello there 👋\nPlease make sure to send me a supported toy control link (Lovense, xtoys, Handyfeeling) to get anonymously controlled by another member. \n\nIf you are looking for group control or orgies, those will be added soon.`).catch(o_o => { console.log(o_o) });
	}

	console.log('DM3')
	if (msg.deleted) 
		return;
		
	console.log('DM4')
	//Note: This is to deliver messages that are send to a mod channel. we can keep this just in case
/*
	let sDesc = `\n${msg.content.toString()}\n`;
	const embed = new EmbedBuilder()
		.setAuthor(`${msg.author.tag} (${msg.author.id}) contacted me.`, msg.author.displayAvatarURL(128))
		.setTitle(`__New Message received:__`)
		.setDescription(sDesc)
		.addFields({name: 'USER', value: msg.author, inline: true})
		.addFields({name: 'REPLY', value: `${msg.client.commandPrefix}dm ${msg.author.id}`, inline: true})
		.setFooter({text: `Reply to ${msg.author.tag} with ${msg.client.commandPrefix}dm <@${msg.author.id}> :)`})
		.setColor(0xf44336)
		.setTimestamp()
		.setThumbnail( msg.author.displayAvatarURL(512));
	// embed.setURL(`https://discordapp.com/channels/@me/${msg.author.id}`); it's not proper.
	
	let attachments = msg.attachments || []; 
	if(attachments.length) {
		sDesc += `\n\n**Contains Assets:**`;
		attachments.forEach(at => {
			//embed.addFields(at.name, at.proxyURL);
			sDesc += `\n${at.name} ( here )`; //  - ${at.proxyURL}`;
		});
		embed.setImage(attachments[0].proxyURL);
		embed.setDescription(sDesc);

		if(attachments.length > 1) {
			//we send followup embeds.
			attachments.shift();
			attachments.forEach(at => {
				embed.setImage(at.proxyURL);
				embed.setDescription(`Followup asset: ${at.name}`);
				channel.send({embeds: [embed]}).catch(console.log);
			})
		}
	} else {
		channel.send({embeds: [embed]}).catch(console.log);
	}
	//Shall we do the LovenseANON Processing here as well :)

	*/
};