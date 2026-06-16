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

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js"); // This is to send the image via discord.
const roleRegex = /^Gender: (\S+)/;
const roleRegexOrientation = /^Sexual Orientation: (\S+)/;
/* eslint-disable no-useless-escape */
const text_regex = /(.*?)(?=\[)/;
const toys_regex = /(?<=\[)(.*?)(?=\])/;
const time_regex = /(?<=\[)[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?(?=\])/;
const link_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const tags_regex = /\[#[^\]]*]/g;
//const tags_regex = (?<=\[#)[^\]]*(?=\]) //tags without [# ]

const moment = require('moment');
const nums = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

//const request = require('node-superfetch');
const { ChannelType } = require('discord.js');

module.exports = async (interaction, ModalTextInput) => {
	try {
		let vmtMemberGender = "Unspecified";
		let vmtMemberOrientation = "not set";
		let anonymous = true;
		let channel = interaction.chanel;
		let messageContent = interaction.message.content;
		if(!messageContent ){
			messageContent="";
		}
		let links_new = messageContent.match(link_regex);
		logger.silly(links_new);
		//if (!links_new) 
			//return false;
		let links = links_new;
		//shallSend = links_new.length > 0;
		let timeLeft = [];
		let toys = [];
		let text = [];
		let tags = [];
		let emojiReactions = [];
		emojiReactions.push(emojis["unknown"]);
		let shallSend = true;

		
		if(links ){
		//emojiReactions.push(emojis[toyNames[i]]);
			toys = messageContent.match(toys_regex);
			if(toys == null) 
				toys = ['unknown'];
			timeLeft = messageContent.match(time_regex);
			if(timeLeft == null) 
				timeLeft = ['unknown'];
			text = messageContent.match(text_regex);
			if(text == null) {
				if(interaction.message.embeds[0].fields[5]) {
					text = [`${interaction.message.embeds[0].fields[5].value}`];
				} else {
					text = []
				}
			}
			tags = messageContent.match(tags_regex);
			if(tags == null) 
				tags = ['-'];
		}

		//let guilds = msg.client.guilds.cache.array().filter(g => g.members.cache.has(msg.author.id));
		
		/* guild check, will be added back in later
		let l = true;
		if(!l){

			let guilds = [...interaction.message.client.guilds.cache.values()].filter(g => g.members.cache.has(interaction.message.author.id));
			//guilds = guilds.filter(g => msg.client.provider.get(g, 'linkChannel', '') != '' || g.id == GUILD_ID)
			guilds = guilds.filter(g => g.id == GUILD_ID);

			//guilds = guilds.filter(g => msg.client.provider.get(g, 'linkChannel', '') != '' || g.id == GUILD_ID)
			let opt = 0;
			if (guilds.length > 1){
				const chooseEmbed = new EmbedBuilder()
					.setTitle('Where do you want to post the link?')
					.setDescription(`React to choose\n\n${guilds.map((g, i) => `${nums[i]} ${g.name}`).join('\n')}`)
					.setColor('#00ffff')

				let msg1 = await interaction.message.channel.send({embeds: [chooseEmbed]});
				for(let i in guilds){
					msg1.react(nums[i]).catch(err => { console.error('one of the emojis failed to react.', err)} );
				}
				const filter = (reaction, user) => user.id == interaction.message.author.id;
				let reactions = await msg1.awaitReactions({filter, max: 1});
				let emoji = reactions.first().emoji.name
				opt = parseInt(emoji.charAt(0)) - 1;
				interaction.message.delete().catch(o_O => { console.log(o_O) });
				if(isNaN(opt) || opt >= guilds.length)
					return interaction.message.channel.send('Invalid option. Send the link again.')
			} else {
				opt = 0;
			}
		}*/

		//if(guilds[opt].id == GUILD_ID){
		if(interaction.customId == "button_start_control_link"){

			const vmtMember = await interaction.message.client.guilds.cache.get(GUILD_ID).members.fetch(interaction.message.author);
			//let strippedMessage = interaction.message.content.replace(link_regex, '');
			if (!vmtMember) {
				return interaction.message.reply(`You are not a part of our awesome VibeMyToy server Join now: https://discord.gg/vibemytoy.`).catch(o_o => { console.log(o_o) });
			}

			channel = interaction.message.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
			let bIsVerfied = vmtMember.roles.cache.has(ROLE_VERIFIED_ID);
			bIsVerfied = true;
			if(bIsVerfied){
				const chooseEmbed = new EmbedBuilder();
				chooseEmbed.setTitle('Where do you want to post the link?');
				chooseEmbed.setDescription(`Choose between 🆓Public and 🆔Verified only`);
				chooseEmbed.setColor('#00ffff');


			

			//embed.setThumbnail(`https://cdn.discordapp.com/emojis/${emojis[toyNames[i]]}.png`); // last
			chooseEmbed.addFields({name: 'Toys', value: `${toys[0]}`, inline: true})
			chooseEmbed.addFields({name: 'Session duration', value: `${timeLeft[0]}`, inline: true});
			if(tags.length !== 0)
			chooseEmbed.addFields({name: 'Tags', value: `${tags}`, inline: false});
			//chooseEmbed.addFields({name: 'Message', value: text[0], inline: false});
			//embed.addFields({name: 'Control requests', '0', true);

					const row = new ActionRowBuilder()
					.addComponents(
					new ButtonBuilder()
						.setCustomId(`button_nonverified`)
						.setLabel('Public')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('🆓'),
						new ButtonBuilder()
						.setCustomId(`button_verified`)
						.setLabel('Verified only')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('🆔'),
					);
				let msg2 = await interaction.message.edit({embeds: [chooseEmbed], components: [row]});
				/*
				const filter = (interaction) => (interaction.customId === 'button_nonverified' || interaction.customId === 'button_verified');
				let interactions = await msg2.awaitMessageComponent({filter, max: 1});
				switch(interactions.customId){
					case 'button_nonverified':
						channel = interaction.message.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
						chooseEmbed.addFields({name: "Channel", value: "Public"})
						msg2 = await interaction.message.edit({embeds: [chooseEmbed], components: [row]});
						break;
					case 'button_verified':
						channel = interaction.message.client.channels.cache.get(CHAN_ID_TRUSTED_ANON);
						chooseEmbed.addFields({name: "Channel", value: "Verified only"})
						msg2 = await interaction.message.edit({embeds: [chooseEmbed], components: [row]});
						break;
				}
				*/
			}else{
				channel = interaction.message.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
			}
		}

		let anon = true;
		if(interaction.customId == "button_nonverified" || interaction.customId === 'button_verified'){

			let field = "";
			if(interaction.customId == "button_nonverified"){
				field = {name: "Channel", value: "Public", inline: true}
			} else {
				field = {name: "Channel", value: "Verified only", inline: true}
			}

			const receivedEmbed = interaction.message.embeds[0];
			const exampleEmbed = EmbedBuilder.from(receivedEmbed).setTitle('Do you want to stay anonymous?').setDescription(`The link will be either posted anonymously or will show your profile. \nPlease select:`).addFields(field);
			//channel.send({ embeds: [exampleEmbed] });

			/*const chooseEmbed = new EmbedBuilder();
			chooseEmbed.setTitle('Do you want to stay anonymous?');
			chooseEmbed.setDescription(`The link will be either posted anonymously or will show your profile. \nPlease select:`);
			chooseEmbed.setColor('#00ffff');
			*/
			const row = new ActionRowBuilder()
			.addComponents(
			new ButtonBuilder()
				.setCustomId(`button_anonymous`)
				.setLabel('Yes, stay anonymous')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('✅'),
				new ButtonBuilder()
				.setCustomId(`button_reveal`)
				.setLabel('No, reveal my profile')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('❌'),
			);
			
			let msg3 = await interaction.message.edit({embeds: [exampleEmbed], components: [row]});
		}

		/*
		let preferences = false
		if(preferences == true){
			if(interaction.customId == "button_anonymous"){
				anonymous = true;
			} else {
				anonymous = false;
			}
			const chooseEmbed = new EmbedBuilder()
			.setTitle('Should your preferences match?')
			.setDescription(`We will look at your roles, f.e. if you are hetero- or homosexual. If you select yes, only members with matching your profile will be allowed to grab links. \nWe look at the following roles: Sexual Orientation & Age Group. \n**Please note that it probably will take longer until someone grabs your link!**\nPlease select:`)
			.setColor('#00ffff')

			const row = new ActionRowBuilder()
			.addComponents(
			new ButtonBuilder()
				.setCustomId(`button_match`)
				.setLabel('Yes, only matching preferences')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('✅'),
				new ButtonBuilder()
				.setCustomId(`button_any`)
				.setLabel('No, anyone can control me')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('❌'),
			);

			let msg4 = await interaction.message.cedit({embeds: [chooseEmbed], components: [row]});

		}*/

		if (interaction.customId == "button_anonymous" || interaction.customId == "button_reveal") {

			let field = "";
			if(interaction.customId == "button_anonymous"){
				field = {name: "Stay anonymous", value: "yes"}
			} else {
				field = {name: "Stay anonymous", value: "no"}
			}
			if(text[0] == "" || text[0] == undefined){
				text[0] = "-";
			}
			let field2 = {name: 'Message', value: text[0], inline: false}
			const receivedEmbed = interaction.message.embeds[0];
			const exampleEmbed = EmbedBuilder.from(receivedEmbed).setTitle('Do you want add an additional message?\nF.e. "Low vibes only').setDescription(`Please click on the button below to enter your message`).addFields(field).addFields(field2);

/*
			const chooseEmbed = new EmbedBuilder()
			.setTitle('Do you want add an additional message?\nF.e. "Low vibes only"')
			.setDescription(`Please click on the button below to enter your message`)
			.setColor('#00ffff')
*/

			const row = new ActionRowBuilder()
			.addComponents(
			new ButtonBuilder()
				.setCustomId(`button_no_message`)
				.setLabel('Start raffle')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('✅'),
			new ButtonBuilder()
				.setCustomId(`button_add_edit_message`)
				.setLabel('Add/Edit message')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('➕'),
			);
			let msg4 = await interaction.message.edit({embeds: [exampleEmbed], components: [row]});
		}

		if(interaction.customId == "button_add_edit_message") {
			if(text[0] == "" || text[0] == undefined){
				text[0] = "";
			}
			const modal = new ModalBuilder()
			.setCustomId('ModalMessage')
			.setTitle('What do you want me to say?');
			// Add components to modal
			// Create the text input components
			const ModalText = new TextInputBuilder()
				.setCustomId('ModalText')
				.setLabel("Please enter your message:")
				// Paragraph means multiple lines of text.
				.setMaxLength(2000)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(text[0]);
		

				
			// An action row only holds one text input,
			// so you need one action row per text input.
			const firstActionRow = new ActionRowBuilder().addComponents(ModalText);

			modal.addComponents(firstActionRow);
			// Show the modal to the user
			await interaction.showModal(modal);
		}
		
		if(interaction.customId == "ModalMessage"){
			if(ModalTextInput == ""){
				ModalTextInput = "-";
			}
			let field = {name: 'Message', value: ModalTextInput, inline: false};
			const receivedEmbed = interaction.message.embeds[0];
			const exampleEmbed = EmbedBuilder.from(receivedEmbed).spliceFields(-1, 1).addFields(field);
			let msg5 = await interaction.message.edit({embeds: [exampleEmbed]});
			await interaction.deferUpdate();
		}

		if(interaction.customId == "button_no_message"){
			// Check Gender
			const vmtMember = await interaction.message.client.guilds.cache.get(GUILD_ID).members.fetch(interaction.user.id);
			const guildRoles = vmtMember.roles.cache.map(g => g.name);
			for(let roleName of guildRoles){
				let result = roleRegex.exec(roleName);
				if (result)
					vmtMemberGender = result[1];

				let result2 = roleRegexOrientation.exec(roleName);
				if (result2)
					vmtMemberOrientation = result2[1];
			}

			/* Valentines role
			let addRoles = [];
			let role = interaction.message.client.guilds.cache.get(GUILD_ID).roles.cache.find(r => r.id === "1075024749199097908");
			addRoles.push(role)
			await vmtMember.roles.add(addRoles);
			*/


			const embed = new EmbedBuilder()
			.setTimestamp()

			//embed.setThumbnail(`https://cdn.discordapp.com/emojis/${emojis[toyNames[i]]}.png`); // last
			embed.addFields({name: 'Toys', value: `${toys[0]}`, inline: true})
			embed.addFields({name: 'Session duration', value: `${timeLeft[0]}`, inline: true});
			if(tags.length !== 0)
				embed.addFields({name: 'Tags', value: `${tags}`, inline: false});
			//embed.addFields({name: 'Control requests', '0', true);

			if (shallSend) {
				if (interaction.message.embeds[0].fields[4].value == "no"){
					embed.setAuthor({ name: `${vmtMember.displayName}`, iconURL: `${vmtMember.user.displayAvatarURL(128)}`});
				}else{
					embed.setAuthor({ name: 'Anonymous Control Link', iconURL: 'https://cdn.discordapp.com/emojis/586129923882614794.png'});
				}
				text = ['No message included'];
				// Strip URL from message
				const sDesc = JSON.stringify(text[0]);
				//let strippedMessage = messageContent.replace(link_regex, '');
				//if (strippedMessage.trim().length == 0) 
					//strippedMessage = 'No message included';

					console.log('here3')
					embed.setColor(0xf44336);
					embed.setTitle('Toy Control Link raffle');
					embed.setDescription(`The 30s countdown will start after the first 💕 button click`);
					if (interaction.message.embeds[0].fields[4].value == "no"){
						embed.addFields({name: 'Member', value: `${vmtMember.displayName}\n(<@${vmtMember.id}>)`});
						embed.addFields({name: 'Gender', value: vmtMemberGender, inline: true});
						embed.addFields({name: 'Sexual Orientation', value: vmtMemberOrientation, inline: true});
					}
					embed.addFields({name: 'Message', value: interaction.message.embeds[0].fields[5].value, inline: false});
					embed.setFooter({text: 'Click the 💕 button to enter the raffle!', iconURL: 'https://cdn.discordapp.com/emojis/586129923882614794.png'});
				
				const row = new ActionRowBuilder()
				.addComponents(
				new ButtonBuilder()
					.setCustomId(`toycontrollink-${links_new}`)
					.setLabel('Click here to control')
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('💕'),
				);
				if (interaction.message.embeds[0].fields[3].value == "Public"){
					channel = interaction.message.client.channels.cache.get(CHAN_ID_ANON_CONTROL);
				} else {
					channel = interaction.message.client.channels.cache.get(CHAN_ID_TRUSTED_ANON);
				}
				let finalMsg = await channel.send({content: `<@&${ROLE_PING_CONTROL_LINK}>`, embeds: [embed], components: [row]}).catch(o_O => { console.log(o_O) });

				const exampleEmbed = new EmbedBuilder()
				.setTitle('Finished')
				.setDescription(`Your link was sent to: <#${channel.id}>`);
			
				interaction.message.edit({ embeds: [exampleEmbed], components: [] });

				//interaction.message.edit(`sent to: <#${channel.id}>`);

				if (emojiReactions.length == 0) 
					interaction.message.react('❌').catch(O_o => { console.log(O_o) });	//❌\u274C
				else
					interaction.message.react('👍').catch(O_o => { console.log(O_o) }); // vibemytoy emoticon :D 
				
				//await msg.client.provider.set('global', finalMsg.id, links).catch(err => { console.error('error setting')} );


				return finalMsg;
				
			} else {
				interaction.message.react('❌').catch(O_o => { console.log(O_o) });	//❌
				return false;
			}
		}
	} catch (error) {
		console.log(error);
	}
}