require('dotenv').config();
const logger = require('../util/Logger.js');
const { GUILD_ID, ROLE_VERIFIED_ID, CHAN_ID_ANON_CONTROL, CHAN_ID_TRUSTED_ANON, CHAN_ID_GROUP_CONTROL, CHAN_ID_TOY_CONTROL, CHAN_ID_30PLUS_CONTROL, CHAN_ID_ON_DISPLAY_CHAT } = process.env;
const { EMOJI_AMBI, EMOJI_CALOR, EMOJI_DIAMO, EMOJI_DOLCE, EMOJI_DOMI, EMOJI_EDGE, EMOJI_FERRI, EMOJI_GUSH, EMOJI_HUSH, EMOJI_HYPHY, EMOJI_MAX, EMOJI_MISSION, EMOJI_NORA, EMOJI_LUSH, EMOJI_OSCI, EMOJI_MACHINE, EMOJI_REMOTE } = process.env;
const { ROLE_PING_CONTROL_LINK } = process.env;
//const baseURL = 'https://apps2.lovense.com/app/ws/loading/SESSION?_='
//const commandURL = 'https://apps.lovense.com/app/ws/command/SESSION'
const emojis = {
	ambi: EMOJI_AMBI,
	calor: EMOJI_CALOR,
	diamo: EMOJI_DIAMO,
	dolce: EMOJI_DOLCE,
	domi: EMOJI_DOMI,
	edge: EMOJI_EDGE,
	ferri: EMOJI_FERRI,
	gush: EMOJI_GUSH,
	hush: EMOJI_HUSH,
	hyphy: EMOJI_HYPHY,
	lush: EMOJI_LUSH,
	max: EMOJI_MAX,
	mission: EMOJI_MISSION,
	nora: EMOJI_NORA,
	osci: EMOJI_OSCI,
	quake: EMOJI_DOLCE, 
	blast: EMOJI_MACHINE,
	ridge: EMOJI_MACHINE,
	machine: EMOJI_MACHINE,
	remote: EMOJI_REMOTE,
	unknown: "❓"
}

const { MessageActionRow, MessageButton, EmbedBuilder} = require("discord.js"); // This is to send the image via discord.
const roleRegex = /^Gender: (\S+)/;
const roleRegexOrientation = /^Sexual Orientation: (\S+)/;
const link_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

/** post : order: {'cate':'id','id':{'f48f4a391069':{'v':1,'p':0,'r':0}}}
  post: order: {'cate':'id','id':{'f48f4a391069':{'v':6,'p':0,'r':0}}}
**/
/** Loading - current session status: 
{'result':true,'message':null,'code':0,'data':{'startTimer':true,'leftTime':234,'allow2way':false,'modelSyncTid':'','version':'101','codeState':'0','toyData':{'f48f4a391069':{'name':'lush','id':'f48f4a391069','battery':'100','status':1}},'customerVersion':'101','status':'controlling','toy':'lush'}}
**/
const moment = require('moment');
const nums = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

const request = require('node-superfetch');
const { ChannelType } = require('discord.js');

module.exports = async (channel, msg) => {
	
	try {
	if (msg.channel.id === CHAN_ID_GROUP_CONTROL) // Check if the link is sent in dm, group control or toy control channel
		return;// Group control links are handled by trustplay completly
	

	let directSend = false;
	const enabledChannels = [CHAN_ID_TOY_CONTROL, CHAN_ID_30PLUS_CONTROL, CHAN_ID_ON_DISPLAY_CHAT];
	//const enabledChannels = msg.client.provider.get(msg.guild, 'LinksAllowed', []);
	if (msg.channel.type != ChannelType.DM && (!enabledChannels.includes(msg.channel.id) || !enabledChannels.includes(msg.channel.id))) {
		msg.delete().catch(o_O => { console.log(o_O) });
		return msg.channel.send(`${msg.author} control links are not allowed in this channel!`);
	} else if(msg.channel.type != ChannelType.DM) {
		//msg.delete().catch(err => undefined);
		directSend = true;
	}

	const requestOptions = {
		redirect: 'manual',
		follow: 0,
		compress: false
	};

	logger.silly("channel:");
	logger.silly(JSON.stringify(channel, null, 2));

	logger.silly("msg:");
	logger.silly(JSON.stringify(msg, null, 2));


	const vmtMember = await msg.client.guilds.cache.get(GUILD_ID).members.fetch(msg.author);
	let vmtMemberGender = "Unspecified";
	let vmtMemberOrientation = "not set";
	let anonymous = true;
    let strippedMessage = msg.content.replace(link_regex, '');
	if (!vmtMember) {
		return msg.reply(`You are not a part of our awesome VibeMyToy server Join now: https://discord.gg/vibemytoy.`).catch(o_o => { console.log(o_o) });
	}

	if(!directSend){
		//let guilds = msg.client.guilds.cache.array().filter(g => g.members.cache.has(msg.author.id));


		let guilds = [...msg.client.guilds.cache.values()].filter(g => g.members.cache.has(msg.author.id));
		//guilds = guilds.filter(g => msg.client.provider.get(g, 'linkChannel', '') != '' || g.id == GUILD_ID)
		guilds = guilds.filter(g => g.id == GUILD_ID);

		//guilds = guilds.filter(g => msg.client.provider.get(g, 'linkChannel', '') != '' || g.id == GUILD_ID)
		let opt = 0;
		if (guilds.length > 1){
			const chooseEmbed = new EmbedBuilder()
				.setTitle('Where do you want to post the link?')
				.setDescription(`React to choose\n\n${guilds.map((g, i) => `${nums[i]} ${g.name}`).join('\n')}`)
				.setColor('#00ffff')

			let msg1 = await msg.channel.send({embeds: [chooseEmbed]});
			for(let i in guilds)
				msg1.react(nums[i]).catch(err => { console.error('one of the emojis failed to react.', err)} );

			const filter = (reaction, user) => user.id == msg.author.id;
			let reactions = await msg1.awaitReactions({filter, max: 1});
			let emoji = reactions.first().emoji.name
			opt = parseInt(emoji.charAt(0)) - 1;
			msg.delete().catch(o_O => { console.log(o_O) });
			if(isNaN(opt) || opt >= guilds.length)
				return msg.channel.send('Invalid option. Send the link again.')
		} else {
			opt = 0;
		}

		if(guilds[opt].id == GUILD_ID){
			channel = msg.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
			let bIsVerfied = vmtMember.roles.cache.has(ROLE_VERIFIED_ID)
			if(bIsVerfied){
				const chooseEmbed = new EmbedBuilder()
					.setTitle('Where do you want to post the link?')
					.setDescription(`React to choose\n\n🆓 Public\n🆔 Verified only`)
					.setColor('#00ffff')

				let msg2 = await msg.channel.send({embeds: [chooseEmbed]});
				msg2.react('🆓').catch(err => { console.error('one of the emojis failed to react.', err)} );
				msg2.react('🆔').catch(err => { console.error('one of the emojis failed to react.', err)} );

				const filter = (reaction, user) => user.id == msg.author.id && (reaction.emoji.name == '🆓' || reaction.emoji.name == '🆔');
				let reactions = await msg2.awaitReactions({filter, max: 1});
				switch(reactions.first().emoji.name){
					case '🆓':
						channel = msg.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
						msg2.delete().catch(o_O => { console.log(o_O) });
						break;

					case '🆔':
						channel = msg.client.channels.cache.get(CHAN_ID_TRUSTED_ANON);
						msg2.delete().catch(o_O => { console.log(o_O) });
						break;
				}
			}else{
				channel = msg.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
			}

			const chooseEmbed = new EmbedBuilder()
			.setTitle('Do you want to send the link anonymous?')
			.setDescription(`React to choose\n\n✅ Yes anonymous\n❌ No reveal my username`)
			.setColor('#00ffff')

			let msg3 = await msg.channel.send({embeds: [chooseEmbed]});
			msg3.react('✅').catch(err => { console.error('one of the emojis failed to react.', err)} );
			msg3.react('❌').catch(err => { console.error('one of the emojis failed to react.', err)} );

			const filter = (reaction, user) => user.id == msg.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌');
			let reactions = await msg3.awaitReactions({filter, max: 1});
			switch(reactions.first().emoji.name){
				case '✅':
					anonymous = true;
					msg3.delete().catch(o_O => { console.log(o_O) });
					break;

				case '❌':
					anonymous = false;
					msg3.delete().catch(o_O => { console.log(o_O) });
					break;
			}

			
			
			if (strippedMessage.trim().length == 0) {

				const chooseEmbed = new EmbedBuilder()
				.setTitle('Do you want add an additional message?\nF.e. "Low vibes only"')
				.setDescription(`React to choose\n\n✅ Yes\n❌ No`)
				.setColor('#00ffff')

				let msg4 = await msg.channel.send({embeds: [chooseEmbed]});
				msg4.react('✅').catch(err => { console.error('one of the emojis failed to react.', err)} );
				msg4.react('❌').catch(err => { console.error('one of the emojis failed to react.', err)} );
				
				const filter = (reaction, user) => user.id == msg.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌');
				let reactions = await msg4.awaitReactions({filter, max: 1});
				switch(reactions.first().emoji.name){
					case '✅': {
						let timestamp = Math.floor(Date.now() / 1000);
						let msg5 = await msg.reply(`Please enter your message and press enter! You have 30 seconds to answer, otherwise your link will be send without message.\n**Link will be sent without message <t:${timestamp+32}:R>**
						`);
						const filter2 = res => res.author.id === msg.author.id;
						await msg.channel.awaitMessages({ filter2, max: 1, time: 30000, errors: ['time'] })
						.then( answer => {
							strippedMessage = answer.first().content;
							msg4.delete().catch(o_O => { console.log(o_O) });
							msg5.delete().catch(o_O => { console.log(o_O) });
							//answer[1].delete()
						}
						)
						.catch(collected => {
							strippedMessage = 'No message included';
							msg4.delete().catch(o_O => { console.log(o_O) });
							msg5.delete().catch(o_O => { console.log(o_O) });
						});




						// Await !vote message1
						const filter = m => m.content.startsWith('!vote');
						// Errors: ['time'] treats ending because of the time limit as an error
						channel.awaitMessages({ filter, max: 4, time: 60_000, errors: ['time'] })
						.then(collected => console.log(collected.size))
						.catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));

/*
						if (answer.entries.length != 0) {
							strippedMessage = answer.first().content;
						}else{
							strippedMessage = 'No message included';	
						}
						*/
						break;
					}
					case '❌':
						strippedMessage = 'No message included';
						msg4.delete().catch(o_O => { console.log(o_O) });
						break;
				}
			} else {
				//nothing to do here	
			}
		}else {
			channel = msg.client.channels.cache.get(msg.client.provider.get(guilds[opt], 'linkChannel'))
		}
	}

	



	// Check Gender
	const guildRoles = vmtMember.roles.cache.map(g => g.name);
	for(let roleName of guildRoles){
		let result = roleRegex.exec(roleName);
		if (result)
			vmtMemberGender = result[1];

		let result2 = roleRegexOrientation.exec(roleName);
		if (result2)
			vmtMemberOrientation = result2[1];
	}



	let shallSend = false;
	let messageContent = msg.content;

	let links_new = messageContent.match(link_regex);
	logger.silly(links_new);
	if (!links_new) 
		return false;

	shallSend = links_new.length > 0;

//https://c.lovense.com/c/
	// we process the first link.
	links_new = links_new.shift();
	const words = links_new.split('/t2/');
	let links = '';
	if(words.length == 2){
		links = `https://c.lovense.com/c/${words[1]}`;	
	} else {

		links = links_new;
		links_new = `https://c.lovense.com/t2/${words[1]}`;
	}
	
	let session = [];
	let body = { message: '' };
	let returnMessage = {
		code: '0',
		message: '-',
		result: false
	}
	let emojiReactions = [];
	let baseURL = '-';
	//let playURL = '-';
	// await sleep(10000);
	let res = {};

	try {
		const res = await request.get(links, requestOptions);
		session = res.url.match(/play\/([^']*)/)
	} catch (err) {
		res = { url: links };
	}

	if (!session) { // FAKE URL
		returnMessage = {
			code: '-1',
			message: 'Fake link',
			result: false
		};
		shallSend = false;
	} else {
		if(session.length) {
			baseURL = `https://api.lovense.com/developer/v2/loading/${session[1]}`
			const { body } = await request.get(baseURL, requestOptions);
			returnMessage = body;
			if (!returnMessage.result) {
				shallSend = true;
				emojiReactions.push(emojis["unknown"]);
				returnMessage = {
					code: '404',
					message: `Session not found: ${res.url}`,
					result: false
				}
			}
		} else {
			returnMessage = {
				code: '-1',
				message: `No match for: ${res.url}`,
				result: false
			}
			shallSend = false;
		}
	}

	// REACTIONS 
	switch (returnMessage.message) {
		case 'Fake link': 
			msg.react('❌').catch(err => { console.error('one of the emojis failed to react.', err)} );
			break;
		
		case 'No Session Found!': 
			msg.react('🏴').catch(err => { console.error('one of the emojis failed to react.', err)} );
			break;
		
		case 'Session already opened!': 
			msg.react('🏁').catch(err => { console.error('one of the emojis failed to react.', err)} );
			break;
		
		case null: case '': 
			break;
		
		default: 
			msg.react('🤷').catch(o_o => { logger.error(`1 ${o_o}`); });
	}
	console.log('here')


	if (msg.channel.type !== ChannelType.DM) {
		if (returnMessage.result) {
			let toyIDs = returnMessage.data.toyId.split(',');
			let toyNames = returnMessage.data.toyType.split(',');
			let toysON = toyIDs.length;
			if (toysON > 0) {
				for (let i = 0; i < toyIDs.length; ++i) {
					if (Object.prototype.hasOwnProperty.call(emojis, toyNames[i])) {
						msg.react(emojis[toyNames[i]]).catch(o_o => { logger.error(`2 ${o_o}`); });
					} else {
						msg.react(emojis["Unknown"]).catch(o_o => { logger.error(`3 ${o_o}`); });
					}
				}
			}
		} else {
			msg.react('❌').catch(o_o => { logger.error(`4 ${o_o}`); }); //❌
		}
		return; //test!
	}

	const embed = new EmbedBuilder()
		.setTimestamp()
	
	switch (returnMessage.result) {
		case true: {
			let toyIDs = returnMessage.data.toyId.split(',');
			let toyNames = returnMessage.data.toyType.split(',');
			let toysON = toyIDs.length;
			let timeLeft = 'unknown';
			if (toysON > 0) {
				for (let i = 0; i < toysON; ++i) {
					timeLeft = moment.duration(returnMessage.data.leftTime, 'seconds').humanize();
					if (returnMessage.data.leftTime == 0) 
						timeLeft = 'Till dead';
					
					if (Object.prototype.hasOwnProperty.call(emojis, toyNames[i])) {
						emojiReactions.push(emojis[toyNames[i]]);
						embed.setThumbnail(`https://cdn.discordapp.com/emojis/${emojis[toyNames[i]]}.png`); // last
					}
				}
//{name: 'Awesome?', value: 'true', inline: true}
				embed.addFields({name: 'Toys', value: `${capitalizeFirstLetter(returnMessage.data.toyType)}`, inline: true})
				embed.addFields({name: 'Session duration', value: timeLeft, inline: true});
				//embed.addFields({name: 'Control requests', '0', true);
			}
			break;
		}
		default: {
			// for false result or invalid.
			embed.addFields({name: 'Toy', value: 'unknown', inline: true});
			embed.addFields({name: 'Session duration', value: 'unknown', inline: true});
			//embed.addFields({name: 'Control requests', value: 0, inline: true);
		}
	}

	if (shallSend) {
		if (anonymous == true){
			embed.setAuthor({ name: 'Anonymous Control Link', iconURL: 'https://cdn.discordapp.com/emojis/586129923882614794.png'});
		}else{
			embed.setAuthor({ name: `${vmtMember.displayName}`, iconURL: `${vmtMember.user.displayAvatarURL(128)}`});
		}
		// Strip URL from message
		const sDesc = JSON.stringify(returnMessage);
		//let strippedMessage = messageContent.replace(link_regex, '');
		//if (strippedMessage.trim().length == 0) 
			//strippedMessage = 'No message included';

			console.log('here3')
		if(directSend){
			embed.setColor(0xf44336);
			embed.setTitle('Grab the link');
			embed.setURL(links);
			embed.addFields({name: 'Gender', value: vmtMemberGender});
			embed.addFields({name: 'Message', value: strippedMessage, inline: false});
			embed.setFooter({text: msg.author.username, iconURL: 'https://cdn.discordapp.com/emojis/586129923882614794.png'});
			console.log('here4')
			return await msg.channel.send({embeds: [embed]});
		}else{
			embed.setColor(0xf44336);
			embed.setTitle('Toy Control Link raffle');
			embed.setDescription(`The 30s countdown will start after the first 💕 button click`);
			if (anonymous == false){
				embed.addFields({name: 'Member', value: `${vmtMember.displayName}\n(<@${vmtMember.id}>)`});
				embed.addFields({name: 'Gender', value: vmtMemberGender, inline: true});
				embed.addFields({name: 'Sexual Orientation', value: vmtMemberOrientation, inline: true});
			}
			embed.addFields({name: 'Message', value: strippedMessage, inline: false});
			embed.setFooter({text: 'Click the 💕 button to enter the raffle!', iconURL: 'https://cdn.discordapp.com/emojis/586129923882614794.png'});
		}

		const row = new MessageActionRow()
		.addComponents(
		new MessageButton()
			.setCustomId(`toycontrollink-${links_new}`)
			.setLabel('Click here to control')
			.setStyle('SECONDARY')
			.setEmoji('💕'),
		);
		let finalMsg = await channel.send({content: `<@&${ROLE_PING_CONTROL_LINK}>`, embeds: [embed], components: [row]}).catch(o_O => { console.log(o_O) });
		//const sentMessage = await interaction.editReply({ content: `<@${member.user.id}>'s Profile:`, embeds: [embed], components: [row] });
		//await finalMsg.react('✅').catch(err => { console.error('one of the emojis failed to react.')} );
		msg.channel.send(`sent to: <#${channel.id}>`);

		if (emojiReactions.length == 0) 
			msg.react('❌').catch(O_o => { console.log(O_o) });	//❌\u274C
		else
			if (!returnMessage.result) {
				msg.react('❓').catch(O_o => { console.log(O_o) }); //❓\u2753
			} else
				msg.react('👍').catch(O_o => { console.log(O_o) }); // vibemytoy emoticon :D 
			
		emojiReactions.forEach(emoji => {
			if (emoji) 
				finalMsg.react(emoji).catch(O_o => { console.log(O_o) });
			msg.react(emoji).catch(O_o => { console.log(O_o) })
		});
		
		//await msg.client.provider.set('global', finalMsg.id, links).catch(err => { console.error('error setting')} );
		return finalMsg;
		
	} else {
		msg.react('❌').catch(O_o => { console.log(O_o) });	//❌
		return false;
	}
} catch (error) {
	console.log(error);
  }
  function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
}