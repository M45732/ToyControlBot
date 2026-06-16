const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const devmode = true;
const Command = require('../../structures/Command');
const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const commandName = 'toycontrol';
const ChartDataLabels = require('chartjs-plugin-datalabels');
const LovenseConnect = require('../../util/LovenseConnect');
const { MessageAttachment } = require('discord.js');
const { sendToLovense, loginLovense, GetConnectedToysLovense, logoutLovense, testrun} = require('../../util/LovenseConnect');
var stop = false;
const sleep = require('util').promisify(setTimeout)
const { getDataFromDB } = require('../../structures/sql/Pool.js');


/*

*/
const options = [{
    name: 'type',
    type: ApplicationCommandOptionType.String,
    description: 'Which type?',
    required: false,
    choices: [
		{
            name: 'public',
            value: `public`,
        },/*
        {
            name: 'anonymous',
            value: `anonymous`,
        },*/
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

const options2 = [{
    name: 'type',
    type: ApplicationCommandOptionType.String,
    description: 'Which type?',
    required: false,
    choices: [
		{
            name: 'public',
            value: `public`,
        },/*
        {
            name: 'anonymous',
            value: `anonymous`,
        },*/
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
},
{                
    name: 'user1',
    type: ApplicationCommandOptionType.User,
    description: 'Which user?',
    required: false,
},
{                
    name: 'user2',
    type: ApplicationCommandOptionType.User,
    description: 'Which user?',
    required: false,
},
{                
    name: 'user3',
    type: ApplicationCommandOptionType.User,
    description: 'Which user?',
    required: false,
},
{                
    name: 'user4',
    type: ApplicationCommandOptionType.User,
    description: 'Which user?',
    required: false,
},
{                
    name: 'user5',
    type: ApplicationCommandOptionType.User,
    description: 'Which user?',
    required: false,
}];
	
module.exports = {

	name: commandName,
	group: 'lovense',
	description: `Logins & plays in the lovense connect`,
	format: `/${commandName}`,
	options: [
			/*{ //adding support for control links? (integrate lovenselinkplay)
				name: 'group',
				type: ApplicationCommandOptionType.Subcommand,
				value: `group`,
				description: 'Create a group session (only you and members you invite get controlled)',
				options: options2,
			},*/
			{
				name: 'orgy',
				type: ApplicationCommandOptionType.Subcommand,
				value: `orgy`,
				description: 'Create a orgy session (anyone can join to get controlled)',
				options: options,
			}/*,
			{
				name: 'solo',
				type: ApplicationCommandOptionType.Subcommand,
				value: `solo`,
				description: 'Create a solo session (only you get controlled)',
				options: options,
			},*/
			/*{
				name: 'tip',
				type: ApplicationCommandOptionType.Subcommand,
				value: `tip`,
				description: 'This will start a tip play session, just like on that cam sites you visited last night ;-)',
				options: options,
			},*/
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
	async execute(interaction) {
		await interaction.reply({ content: 'Starting play session... please wait...', ephemeral: true });

		//sql: if member is alreay in other session
		if(interaction.client.qonSessions.find(obj => obj.users.includes(interaction.member.id)) ){
			const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('lovenselogout')
					.setLabel('✅ End other session')
					.setStyle(ButtonStyle.Secondary)
			);
			await interaction.editReply({text: 'You are already controlled in another session, do you want to leave your current session?', components: [row], ephemeral: true}).catch(err => console.error(`SEND EMBED to ${user}:`,err));
		}

		const lovenseConfig = yaml.load(fs.readFileSync(`./config/lovenseOptions.yml`, 'utf8'));

		let controlee = interaction.member;
		let uid = -1;
		let orgy = false;
		let mentioned;
		let pList = {};
		//const cmd = interaction.options.getString('url');
		const mode = interaction.options._subcommand;
		const subcommand = interaction.options;
		let type = interaction.options.getString('type');
		if(!type){type='public'}
		const message = interaction.options.getString('message');
		const user = interaction.options.getUser('user');
		switch(mode) {
			case 'botplay':
				break;

			case 'group':
				break;

			case 'orgy':
				orgy = true;
				break;

			case 'solo':

				break;

			case 'tip':
				//LovenseConnect.logoutLovense(interaction.client, { uid: interaction.member.id, token: lovenseConfig.token }, msg);
				break;
		}































		let sessionMsg = interaction;
		let thread = "";
		loginLovense(interaction.client, lovenseConfig, sessionMsg, interaction, orgy, thread);
		interaction.client.lovense.message_id = sessionMsg.id;

		const filter = i => i.customId === 'lovenselogin' && i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({ filter });

		collector.on('collect', async i => {

			//const emoji = reaction.emoji.name;
			const embed = EmbedBuilder.from(i.message.embeds[0]);

			sessionMsg = i.message;

			switch(i.customId){

				case 'lovenselogin': {

				//sql
					let queryinsertinto = `INSERT INTO toycontrol (discord_guild_id, discord_channel_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed) VALUES (${String(interaction.guildId)}, ${String(interaction.channelId)}, ${String(interaction.applicationId)}, ${String(interaction.member.id)}, 1, '${mode}', '${type}', 0)`;
					let ret = await getDataFromDB(queryinsertinto);

					let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_message_id='${interaction.applicationId}'`;
					let configquery = await getDataFromDB(query);
					let config2 = configquery[0];
					console.log(`(ready::run) last sql='${config.session_mode}'`);

					let toy = await GetConnectedToysLovense(i.user.id);
					//toy = await request.post(`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uIDarray[0]}&command=GetToys`);
					if(toy.length > 0  && toy[0] !="appoffline"){

						// now setup
						lovenseConfig.uids = uid;
						
						let toy = await GetConnectedToysLovense(interaction.member.id);

						const emojiCharacters = lovenseConfig.reactionNumbers;
						const lovenseEmbedThread = new EmbedBuilder();
						const lovenseEmbed = new EmbedBuilder();
						lovenseEmbed.setTitle(`${type} ${mode} session`);
						lovenseEmbed.setDescription(message);
						//lovenseEmbed.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
						//lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
						//.addField('Default level', lovenseConfig.toy_default_level, true)
						lovenseEmbedThread.addFields({name: 'Available reactions', value: '❌ = End / leave the session (Controlled User only)\n:zero: to :five: = Vibration Speed\n:arrow_up: = Max air in\n:arrow_down: = Max air out\n:pause_button: = Nora rotate stop\n:arrows_counterclockwise: = Nora rotate anti-clockwise\n:arrows_clockwise: = Nora rotate clockwise'});

						if(toy.length > 0  && toy[0] !="appoffline") {
							if(mode == "orgy" ){
								lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅.\nClick ❌ to leave the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');
							} else {
								lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nClick ❌ to end the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');
							}
							lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅.\nClick ❌ to leave the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');

							if (type == "anonymous") {
								lovenseEmbed.addFields({name: 'User / Toys', value: `Unknown / ${toy.join(', ')}`});
							} else {
								lovenseEmbed.addFields({name: 'User / Toys', value: `${interaction.member} / ${toy.join(', ')}`});
							}

						}else{
							if (type == "anonymous") {
								lovenseEmbed.addFields({name: 'User', value: `Unknown`, inline: true});
							} else {
								lovenseEmbed.addFields({name: 'User', value: `${interaction.member}`, inline: true});
							}

						}
							
						lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅\n\n```**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');

						//lovenseembed.addFields({name: '\u200B', '\u200B', true);
						lovenseEmbed.addFields({name: 'Current Speed', value: `${lovenseConfig.toy_current_speed} / ${lovenseConfig.toy_max_level}`, inline: true});
						//lovenseEmbed.addFields({name: 'Current Rotation(Nora)', value: 'none', inline: true});
						//lovenseEmbed.addFields({name: 'Current AirPump(Max)', value: 'none', inline: true});
						lovenseEmbed.addFields({name: 'Last Vote', value: '-', inline: true});
						lovenseEmbed.addFields({name: 'Vote result:\n0️⃣=1 \n1️⃣=2\n', value: 'none', inline: true});
						lovenseEmbed.addFields({name: 'Next vote in: ', value: 'none', inline: false});
						lovenseEmbed.setTimestamp();
						lovenseEmbed.setColor('#02e3f3');
						lovenseEmbed.setFooter({text: `Controling by reacting to owner's toy by using the reactions from 0 to ${lovenseConfig.toy_max_level}`})
						//if(toy.length > 0  && toy[0] !="appoffline"){
						//}
						let row = ''
						if (type == "private") {
							row = new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId('lovenselogout')
									.setLabel('⏹ End/Leave session')
									.setStyle(ButtonStyle.Danger),
								new ButtonBuilder()
									.setCustomId('lovenselogout')
									.setLabel('➕ Join session')
									.setStyle(ButtonStyle.Success)
							);
						}else{
							row = new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId('lovenselogout')
									.setLabel('⏹ End/Leave session')
									.setStyle(ButtonStyle.Danger),
							);
						}


						let thread = "";
						var sessionMsg = "";
						if (type == "private") {
							sessionMsg = await interaction.client.users.resolve(controlee).send({embeds: [lovenseEmbed], components: [row]}).then(sentMessage => interaction.client.lovense.panel = sentMessage);
							//type: 'GUILD_PRIVATE_THREAD',
							//const thread = channel.threads.cache.find(x => x.name === 'food-talk');
							//await thread.members.add('140214425276776449');	
						}else{
							sessionMsg = await interaction.channel.send({embeds: [lovenseEmbed], components: [row]})
							
							//create thread here
							thread = await sessionMsg.startThread({
								name: 'control-chat',
								autoArchiveDuration: 60,
								reason: 'This play session is hosted by',
							});

							await thread.send({embeds: [lovenseEmbedThread]}).then(
								//sentMessage => interaction.client.lovense.panel = sentMessage
							);
							console.log(`Created thread: ${thread.name}`);
						}

						const filter2 = (reaction, user) => {
							if(!reaction.emoji)
								return false;
							const e = reaction.emoji.name;
							switch(e){
								case '0️⃣': case '1️⃣': case '2️⃣': case '3️⃣': case '4️⃣': case '5️⃣': case '⏸': case '🔄': case '🔃': case '⬇': case '⬆': case '✅': case '❌': case '♻️': 
									if(!user.bot)
										return true;
							}
							return false;
						}
						const collector2 = sessionMsg.createReactionCollector(filter2, {dispose: true});

						collector2.on('collect', async (reaction, user) => {
							const emoji = reaction.emoji.name;
							switch(emoji){
				
								case '❌':
									stop = true;
									if(config.session_mode =='orgy'){
										if(!config.discord_user_ids.includes(user.id))
											return reaction.users.remove(user.id);
				
										if(config.discord_user_ids.length == 1){
											interaction.client.qonSessions.delete(reaction.message.id);
											reaction.message.delete();
											collector2.stop();
											LovenseConnect.sendToLovense([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
											return;
										}
				
										config.users.splice(config.users.indexOf(user.id), 1);
										LovenseConnect.sendToLovense([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
										embed.spliceFields(1, 1, {name: "User / Toys", value: config.users.map(u => `<@${u}>`).join('\n'), inline: true})
										reaction.message.edit(embed);
									}else{
										if(user.id != config.users[0])
											return reaction.message.channel.send('You are not the creator of this session').then(msg => msg.delete({timeout: 5000}));
				
										LovenseConnect.sendToLovense(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
										interaction.client.qonSessions.delete(reaction.message.id);
										reaction.message.delete();
										collector2.stop();
										return;
									}
									break;
				
								case '0️⃣':
								case '1️⃣':
								case '2️⃣':
								case '3️⃣':
								case '4️⃣':
								case '5️⃣':
									if(config.userreacted.some(userreacted => userreacted.userid == user.id)){
										//reaction.users.remove(user.id).catch(err => { console.log('Failed to remove reaction')} );
									}else{
										// Push to a Multidimensional Array
										if (user.bot == false){
											config.userreacted.push({userid: user.id, reaction: parseInt(reaction.emoji.name.charAt(0))});
											//config.userreacted.userid.push(parseInt(reaction.emoji.name.charAt(0)));
											
				
											let highestEmojiSpeed = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
												.sort((a, b) => b.count - a.count)
												.filter(r => ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(r.name))[0]
											
											let speed = highestEmojiSpeed ? parseInt(highestEmojiSpeed.name.charAt(0)) : undefined;
											//reaction.remove(user.id);
											//reaction.users.remove(user.id);  && config.prevSpeed != parseInt(speed)
											if(speed != undefined){//if is number and between 0 and 5 including
												speed = parseInt(speed);
												//
				
												config.prevSpeed.shift();
				
												config.prevSpeed.push(config.curSpeed);
												config.curSpeed = speed
												
												
												setTimeout(() => { 
													if(config.update_active == false) {
														config.update_active = true
														//sql
														interaction.client.qonSessions.set(reaction.message.id, config);
														embed.spliceFields(3, 1, {name: 'Current Power', value: `${config.curSpeed}/5`, inline: true});
														//reaction.message.edit(embed);		

														LovenseConnect.sendToLovense(
															config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
														);

														//embed.setImage('https://cdn.discordapp.com/attachments/790173243364737024/790228781704282132/file.jpg')
														//embed.spliceFields(6, 1, {name: 'Last Vote', value: `<@${config.userreacted[1].userid}> ${config.userreacted[1].reaction}`, inline: true});
														reaction.message.edit(embed);
														reaction.users.remove(user.id);
														config.userreacted = config.userreacted.filter(item => item.userid !== reaction.user.id);
														config.update_active = false;
														//sql
														return interaction.client.qonSessions.set(reaction.message.id, config);
													}
												
												}, 5000);
												
				
												//sql
												return interaction.client.qonSessions.set(reaction.message.id, config);
											}
										}
									}
				
									break;
								
								case '⏸':
								case '🔃':
								case '🔄': {
									let highestEmojiRotate = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
										.sort((a, b) => b.count - a.count)
										.filter(r => ['⏸', '🔃', '🔄'].includes(r.name))[0]		
									let rotate = highestEmojiRotate ? highestEmojiRotate.name : undefined;
									if(rotate != undefined){
										switch(rotate){
											case '⏸':
												embed.spliceFields(5, 1, {name: 'Current Rotation(Nora)', value: 'none', inline: true});
												config.rotStop = 1;
												LovenseConnect.sendToLovense(
													config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
												);
												break
				
											case '🔄':
												embed.spliceFields(5, 1, {name: 'Rotate', value: 'Anticlockwise', inline: true});
												config.rotACW = 1;
												LovenseConnect.sendToLovense(
													config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
												);
												break;
				
											case '🔃':
												embed.spliceFields(5, 1, {name: 'Rotate', value: 'Clockwise', inline: true});
												config.rotCW = 1;
												LovenseConnect.sendToLovense(
													config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
												);
												break;
										}
									}
									reaction.message.edit(embed);
									break;
								}
								case '⬇':
								case '⬆': {
									let highestEmojiAir = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
										.sort((a, b) => b.count - a.count)
										.filter(r => ['⬇', '⬆'].includes(r.name))[0]
									let air = highestEmojiAir ? highestEmojiAir.name : undefined;
									if(air != undefined){
										switch(air){
											case '⬇':
												embed.spliceFields(4, 1, {name: 'Current AirPump(Max)', value: 'Out', inline: true});
												config.airOut = 1;
												config.airIn = 0;
												LovenseConnect.sendToLovense(
													config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
												);
												break;
				
											case '⬆':
												embed.spliceFields(4, 1, {name: 'Current AirPump(Max)', value: 'In', inline: true});
												config.airIn = 1;
												config.airOut = 0;
												LovenseConnect.sendToLovense(
													config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
												);
												break;
				
										}
										reaction.message.edit(embed);
									}
									break;
								}
				
								
								case '♻️': {
									if(config.orgy){
										if(!config.users.includes(user.id)){
											reaction.users.remove(user.id);
											return reaction.message.channel.send('You are not the creator of this session').then(msg => msg.delete({timeout: 5000}));
										}else{
				
				
											
											let msg3 = await interaction.channel.send('Do you really want to reset this session?');
											msg3.react('✅').catch(err => { console.error('✅ one of the emojis failed to react.')} );
											msg3.react('❌').catch(err => { console.error('❌ one of the emojis failed to react.')} );
								
											const filter = (reaction, user) => user.id == interaction.member.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌');
											let reactions = await msg3.awaitReactions({filter, max: 1});
											switch(reactions.first().emoji.name){
												case '✅':
													msg3.delete();
													LovenseConnect.sendToLovense(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
													reaction.message.channel.send('Reaction reset started').then(msg => msg.delete({timeout: 7000}));
													reaction.message.reactions.cache.get('0️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('1️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('2️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('3️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('4️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('5️⃣').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('⬆').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('⬇').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('⏸').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('🔄').remove().catch(error => console.error('Failed to remove reactions: ', error));
													reaction.message.reactions.cache.get('🔃').remove().catch(error => console.error('Failed to remove reactions: ', error));
						
						
													await sessionMsg.react('0️⃣').catch(err => { console.error('0 one of the emojis failed to react.', err)} );
													await sessionMsg.react('1️⃣').catch(err => { console.error('1 one of the emojis failed to react.', err)} );
													await sessionMsg.react('2️⃣').catch(err => { console.error('2 one of the emojis failed to react.', err)} );
													await sessionMsg.react('3️⃣').catch(err => { console.error('3 one of the emojis failed to react.', err)} );
													await sessionMsg.react('4️⃣').catch(err => { console.error('4 one of the emojis failed to react.', err)} );
													await sessionMsg.react('5️⃣').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
													await sessionMsg.react('⬆').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
													await sessionMsg.react('⬇').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
													await sessionMsg.react('⏸').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
													await sessionMsg.react('🔄').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
													await sessionMsg.react('🔃').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
													return interaction.channel.send('Session reset done, get the orgy started again').then(msg => msg.delete({timeout: 5000}));
													//break;
								
												case '❌':
													collector2.stop();
													return interaction.channel.send('Request canceled').then(msg => msg.delete({timeout: 5000}));
													//break;
											}
										}
										//LovenseConnect.sendToLovense([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
									}
									//sql
									interaction.client.qonSessions.set(reaction.message.id, config);
								}
							}
						})

						collector2.on('dispose', reaction => interaction.channel.send(`Disposed ${reaction.emoji.name}, total is ${collector.total}.`));
						collector2.on('end', collected2 => {
							//this.client.logger.info(`Collected ${collected.size} items`);
							//reaction.message.edit(embed);
							interaction.channel.send(embed);
						});

						//LovenseConnect.loginLovense(this.client, { uid: user.id, token: lovenseConfig.token }, reaction.message, user.id);
						
						//needed?
						//config.users.push(i.user.id);
						//config.users.push(user.id);
						//lovenseembed.addFields({name: 'Users / Toys', `${msg.author} / ${toy.join(', ')}`, true);
						embed.spliceFields(1, 1, {name: "User / Toys", value: config.users.map(u => `<@${u}> / ${toy.join(', ')}`).join('\n'), inline: true})
						//embed.spliceFields(1, 1, {name: "User / Toys", value: 'test'})
						
						//break;
						//interaction.message.edit(embed);


						let clientqon = interaction.client.qonSessions;
						stop = false; //for testing
						testrun(sessionMsg, config, clientqon);
						//toy = toy.data[Object.keys(toy.data)[0]];
						await sessionMsg.react('0️⃣').catch(err => { console.error('0 one of the emojis failed to react.', err)} );
						await sessionMsg.react('1️⃣').catch(err => { console.error('1 one of the emojis failed to react.', err)} );
						await sessionMsg.react('2️⃣').catch(err => { console.error('2 one of the emojis failed to react.', err)} );
						await sessionMsg.react('3️⃣').catch(err => { console.error('3 one of the emojis failed to react.', err)} );
						await sessionMsg.react('4️⃣').catch(err => { console.error('4 one of the emojis failed to react.', err)} );
						await sessionMsg.react('5️⃣').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
						await sessionMsg.react('🔁').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
						await sessionMsg.react('♒').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
						
						//await sessionMsg.react('🏄🏻').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
						
						console.log(toy)

						if(subcommand == "group" || subcommand == "orgy"){
							await sessionMsg.react('⬆').catch(err => { console.error('⬆ one of the emojis failed to react.', err)} );
							await sessionMsg.react('⬇').catch(err => { console.error('⬇ one of the emojis failed to react.', err)} );
							await sessionMsg.react('⏸').catch(err => { console.error('⏸ one of the emojis failed to react.', err)} );
							await sessionMsg.react('🔄').catch(err => { console.error('🔄 one of the emojis failed to react.', err)} );
							await sessionMsg.react('🔃').catch(err => { console.error('🔃 one of the emojis failed to react.', err)} );
						}else{

							if (toy.includes("Max")) {
								interaction.client.user.setActivity(`with MAX`); 
								await sessionMsg.react('⬆').catch(err => { console.error('⬆ one of the emojis failed to react.', err)} );
								await sessionMsg.react('⬇').catch(err => { console.error('⬇ one of the emojis failed to react.', err)} );
							}
							if (toy.includes("Nora")) {
								interaction.client.user.setActivity(`with NORA`); 
								await sessionMsg.react('⏸').catch(err => { console.error('⏸ one of the emojis failed to react.', err)} );
								await sessionMsg.react('🔄').catch(err => { console.error('🔄 one of the emojis failed to react.', err)} );
								await sessionMsg.react('🔃').catch(err => { console.error('🔃 one of the emojis failed to react.', err)} );
							}
							//await interaction.users.remove(sessionMsg.author);
						}
					
					} else {

						if(type == "orgy" || type == "group"){
							loginLovense(interaction.client, { uid: i.user.id, token: lovenseConfig.token }, interaction.message, interaction, true);
							i.message.channel.send('Please follow the instructions you got via DM! Make sure that the Lovense Connect App is running and your toy is connected to it. Then react again to join the orgy').then();
						}else{
							if(!config.users.includes(i.user.id)){
								i.followUp({content: `<@${i.user.id}> This is not an orgy session, only the creator can join it. You can still vote to control.`, ephemeral: true}).then();
							}else{
								if(toy[0] =="appoffline"){
									i.followUp({content: `<@${i.user.id}> The Lovense Remote App is not running. Please start the Lovense connect app, connect your toy and try again.\n(Sometimes the Lovense Connect app is bugged and needs a restart)`, ephemeral: true}).then();
								}else{
									i.followUp({content: `<@${i.user.id}> There is no toy connected to Lovense Connect, make sure that at least one toy is connected in the app and ✅ react again.\n(Sometimes the app is bugged and needs a restart)`, ephemeral: true}).then();
								}
							}
						}
						//return interaction.users.remove(i.user.id);
					}
					break;
				}

			}

		});

		collector.on('remove', (reaction, user) => {

		});
	}
};