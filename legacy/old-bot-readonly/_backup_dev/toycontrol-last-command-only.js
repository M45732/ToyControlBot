const { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const commandName = 'toycontrol';
const LovenseConnect = require('../../util/LovenseConnect');
const { LovenseConnect_send, LovenseConnect_getQrCode, LovenseConnect_GetConnectedToys, LovenseConnect_logout} = require('../../util/LovenseConnect');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { parseTwoDigitYear } = require('moment');
const dev = true;
let config='';
/*

Orgy(only by admins? always active? )

Type: Solo / (Group) / Orgy
Privacy: Public / Private
Mode: ReactionVote / Tip(only in solo)


Public:


Private:


*/

const optionsTip = [{
    name: 'message',
    type: ApplicationCommandOptionType.String,
	maxlength: 2000,
    description: 'which message would you like to send?'
}];

const optionsVote = [{
    name: 'mode',
    type: ApplicationCommandOptionType.String,
    description: 'Public or Private(invite only)?',
    required: false,
    choices: [
		{
            name: 'orgy',
            value: `orgy`,
        },
		{
            name: 'solo',
            value: `solo`,
        }/*,
        {
            name: 'anonymous',
            value: `anonymous`,
        },*/

    ]
},
{
    name: 'privacy',
    type: ApplicationCommandOptionType.String,
    description: 'Public or Private(invite only)?',
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
	
module.exports = {

	name: commandName,
	group: 'lovense',
	description: `Select your play mode: reaction-vote(free orgy) / tip(token tip based)`,
	format: `/${commandName}`,
	options: [
			{ //adding support for control links? (integrate lovenselinkplay)
				name: 'reaction-vote',
				type: ApplicationCommandOptionType.Subcommand,
				value: `group`,
				description: '(free solo/group/orgy session)',
				options: optionsVote,
			},
			{
				name: 'tip',
				type: ApplicationCommandOptionType.Subcommand,
				value: `tip`,
				description: '(token / tip based, like cam sites)',
				options: optionsTip,
			},/*,
			{
				//'Creates a vote session (only you and members you invite get controlled)'
				//Create a orgy session (anyone can join to get controlled)
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
	//start session
	async execute(interaction) {
		await interaction.reply({ content: 'Starting play session... please wait...', ephemeral: true });

		//sql: if member is alreay in other session

		let query = `SELECT discord_message_id, discord_user_id FROM toycontrol_user WHERE discord_user_id=${interaction.member.id}`;
		let query_sessions = await getDataFromDB(query);
		let session = query_sessions[0];

		//let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_user_ids LIKE '%${interaction.member.id}%'`;
		//let query_sessions = await getDataFromDB(query);
		//let session = query_sessions[0];

		if(session != undefined){
			//if(session.discord_user_ids.includes(interaction.member.id)){





			const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('lovenseleave')
					.setLabel('✅ End other session')
					.setStyle(ButtonStyle.Secondary)
			);
			await interaction.editReply({text: 'You are already controlled in another session, do you want to leave the other session?', components: [row], ephemeral: true}).catch(err => console.error(`SEND already in session EMBED to`,err));
				//code to end other session
			//}
			const filter = i => i.customId === 'lovenseleave' && i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter });
	
			collector.on('collect', async i => {
				let querydelete = `DELETE FROM toycontrol_user WHERE discord_user_id=${interaction.member.id}`;
				await getDataFromDB(querydelete);
	
				let query2 = `SELECT discord_message_id, discord_user_id FROM toycontrol_user WHERE discord_message_id=${session.discord_user_id}`;
				let query_sessions2 = await getDataFromDB(query2);
				let session = query_sessions2[0];
			})
		}

		let controlled = interaction.member;
		const subcommand = interaction.options._subcommand;
		let mode = interaction.options.getString('mode');
		if(!mode){mode='public'}
		let privacy = interaction.options.getUser('privacy');
		if(!privacy){privacy='public'}
		const message = interaction.options.getString('message');
		switch(mode) {
			case 'solo':

				break;

			case 'orgy':
				break;

		}

		let img = await LovenseConnect_getQrCode(interaction);

		//.setDescription("You have been added to the Lovense play session")
		//.setThumbnail(img)
		const qrcodeMessage = new EmbedBuilder()
		.addFields({name: "1)  Download App", value: "Download / open the Lovense Remote app([Andriod](https://play.google.com/store/apps/details?id=com.lovense.remote) / [iOS](https://play.google.com/store/apps/details?id=com.lovense.remote))"}) //or **even better** the Lovense Connect app ([Android](https://play.google.com/store/apps/details?id=com.lovense.connect) / [iOS](https://itunes.apple.com/us/app/lovense-connect/id1273067916))
		.addFields({name: "2)  Connect Toy(s)", value: "Connect your toy(s) to the app"})
		.addFields({name: "3a) PC + Mobile", value: "Scan the following QR code with the Lovense Remote / Connect app by clicking the plus icon in the top right: [+] -> Scan QR"})
		.addFields({name: "3b) Mobile only ", value: `Download the QR code here: [QR-Download](${img.message}) and add it to the Lovense Remote app by clicking the plus icon in the top right: ➕ -> Scan QR and click on the album icon to select the downloaded QR code.`})
		//.addFields({name: "3c) Mobile only ", value: `Input the followin code in the Lovense Remote app by clicking the plus icon in the top right: ➕ -> Scan QR -> XY. `})
		.setImage(img.message);
		//DM
		//client.users.resolve(uID).send({embeds: [qrcodeMessage]}).catch(err => console.error(`SEND EMBED to ${user}:`,err));
		//Reply
		//const thread = interaction.channel.threads.cache.find(x => x.name === 'control-chat');
		const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('lovenselogin')
				.setLabel(`✅ I'm ready and followed the above steps`)
				.setStyle(ButtonStyle.Secondary)
		);
		await interaction.editReply({embeds: [qrcodeMessage], components: [row], ephemeral: true}).catch(err => console.error(`SEND lovense login EMBED`,err));
		//console.info(`Logging ${user} from discord to lovense connect.`);

		const filter = i => i.customId === 'lovenselogin' && i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter });

		collector.on('collect', async i => {
			const embed = EmbedBuilder.from(i.message.embeds[0]);
			sessionMsg = i.message;

			switch(i.customId){
				case 'lovenselogin': {

					let toy=[];
					if(dev == true){
						toy=['TestToy'];
					}else{
						toy = await LovenseConnect_GetConnectedToys(i.user.id);
					}

					if(toy.length > 0  && toy[0] !="appoffline"){				
						console.log(toy)
						//sql

						//var json_string = JSON.stringify(json_arr);
						//
						let defaultspeed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						let defaultspeedjson =	JSON.stringify(defaultspeed);
						let queryinsertinto = `INSERT INTO toycontrol (discord_guild_id, discord_channel_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed) VALUES (${String(interaction.guildId)}, ${String(interaction.channelId)}, ${String(interaction.id)}, ${String(interaction.member.id)}, 1, '${mode}', '${subcommand}', '${defaultspeedjson}')`;
						let ret = await getDataFromDB(queryinsertinto);

						let queryinsertinto2 = `INSERT INTO toycontrol_user (discord_message_id, discord_user_id) VALUES (${String(interaction.id)}, ${String(interaction.member.id)})`;
						let ret2 = await getDataFromDB(queryinsertinto2);

						let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_message_id='${interaction.id}'`;
						let configquery = await getDataFromDB(query);
						config = await configquery[0];
						//console.log(`(ready::run) last sql='${config.session_mode}'`);

						//let toy = await LovenseConnect_GetConnectedToys(interaction.member.id);
						const lovenseEmbedThread = new EmbedBuilder();
						const lovenseEmbed = new EmbedBuilder();
						lovenseEmbed.setTitle(`${subcommand} ${mode} session`);
						lovenseEmbed.setDescription(message);
						//lovenseEmbed.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
						//lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
						//.addField('Default level', lovenseConfig.toy_default_level, true)
						lovenseEmbedThread.addFields({name: 'Available reactions', value: '❌ = End / leave the session (Controlled User only)\n:zero: to :five: = Vibration Speed\n:arrow_up: = Max air in\n:arrow_down: = Max air out\n:pause_button: = Nora rotate stop\n:arrows_counterclockwise: = Nora rotate anti-clockwise\n:arrows_clockwise: = Nora rotate clockwise'});

						if(subcommand == "orgy" ){
							lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅.\nClick ❌ to leave the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');
						} else {
							lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nClick ❌ to end the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');
						}
						lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅.\nClick ❌ to leave the session.\nClick ♻️ to reload the session / reactions.```\n\n**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');

						if (privacy == "anonymous") {
							lovenseEmbed.addFields({name: 'User / Toys', value: `Unknown / ${toy.join(', ')}`});
						} else {
							lovenseEmbed.addFields({name: 'User / Toys', value: `${interaction.member} / ${toy.join(', ')}`});
						}

						lovenseEmbedThread.setDescription('**IMPORTANT IF YOU GET CONTROLLED:**```\nIf this is the first time you use this bot, follow the setup instructions that have been send to you via DM. \nAFTER that connect to the bot by reacting via ✅\n\n```**How the control works:**```\nUse only the blue reaction to vibe the toys of all connected user. The highest reaction count is the control level.```\n\nThis bot is brought to you by VibeMyToy [join here](https://discord.gg/vibemytoy)');
						//lovenseembed.addFields({name: '\u200B', '\u200B', true);
						lovenseEmbed.addFields({name: 'Current Speed', value: `0 / 5`, inline: true});
						//lovenseEmbed.addFields({name: 'Current Rotation(Nora)', value: 'none', inline: true});
						//lovenseEmbed.addFields({name: 'Current AirPump(Max)', value: 'none', inline: true});
						lovenseEmbed.addFields({name: 'Last Vote', value: '-', inline: true});
						lovenseEmbed.addFields({name: 'Vote result:\n0️⃣=1 \n1️⃣=2\n', value: 'none', inline: true});
						lovenseEmbed.addFields({name: 'Next vote in: ', value: 'none', inline: false});
						lovenseEmbed.setTimestamp();
						lovenseEmbed.setColor('#02e3f3');
						lovenseEmbed.setFooter({text: `Controling by reacting to owner's toy by using the reactions from 0 to 5`})
						//if(toy.length > 0  && toy[0] !="appoffline"){
						//}
						let row = ''
						if (subcommand == "orgy") {
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
						if (privacy == "private") {
							sessionMsg = await interaction.client.users.resolve(controlled).send({embeds: [lovenseEmbed], components: [row]}).then(sentMessage => interaction.client.lovense.panel = sentMessage);
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



						//LovenseConnect.loginLovense(this.client, { uid: user.id, token: lovenseConfig.token }, reaction.message, user.id);
						
						//needed?
						//config.users.push(i.user.id);
						//config.users.push(user.id);
						//lovenseembed.addFields({name: 'Users / Toys', `${msg.author} / ${toy.join(', ')}`, true);
						//embed.spliceFields(1, 1, {name: "User / Toys", value: config.users.map(u => `<@${u}> / ${toy.join(', ')}`).join('\n'), inline: true})
						//embed.spliceFields(1, 1, {name: "User / Toys", value: 'test'})
						
						//break;
						//interaction.message.edit(embed);

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

						//reactionVoteCollector(sessionMsg, interaction, config)



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

						Lovense_ReactionVote(interaction, config, sessionMsg);
						//reactionVoteCollector(interaction, config, sessionMsg);
					} else {

						if(subcommand == "orgy" || subcommand == "group"){
							LovenseConnect_getQrCode(interaction);
							i.message.channel.send('Please follow the instructions you got via DM! Make sure that the Lovense Connect App is running and your toy is connected to it. Then react again to join the orgy').then();
						}else{
							/*if(!config.discord_user_ids.includes(i.user.id)){
								i.followUp({content: `<@${i.user.id}> This is not an orgy session, only the creator can join it. You can still vote to control.`, ephemeral: true}).then();
							}else{*/
								if(toy[0] =="appoffline"){
									i.followUp({content: `<@${i.user.id}> The Lovense Remote App is not running. Please start the Lovense connect app, connect your toy and try again.\n(Sometimes the Lovense Connect app is bugged and needs a restart)`, ephemeral: true}).then();
								}else{
									i.followUp({content: `<@${i.user.id}> There is no toy connected to Lovense Connect, make sure that at least one toy is connected in the app and ✅ react again.\n(Sometimes the app is bugged and needs a restart)`, ephemeral: true}).then();
								}
							//}
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




async function Lovense_ReactionVote(interaction, config, sessionMsg, collected) {
	//let config = this.client.qonSessions.find(obj => obj.users.includes(msg.author.id));
	//let text = "0, 0, 0, 1, 5, 4, 1, 0, 1, 3";
	const config2 = config;
	//let speed = await config2.toy_speed.split(", ", 13);
	let speed = JSON.parse(config2.toy_speed);
	let current_speed = speed[13];
	let stop = false;
	let count = 0;
	while (stop == false) {
		count++;
		//msg.channel.send('5s message update');
		//let config = this.client.qonSessions.get(msg.id);
		//let config = this.client.qonSessions.find(obj => obj.users.includes(msg.author.id));

		//config.curSpeed = speed

		const embed = EmbedBuilder.from(sessionMsg.embeds[0]);




		let highestEmojiSpeed = sessionMsg.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count-1}}).reverse()
			.sort((a, b) => b.count - a.count)
			.filter(r => ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(r.name))[0]
		let votedspeed = highestEmojiSpeed ? parseInt(highestEmojiSpeed.name.charAt(0)) : undefined;

		let votes = sessionMsg.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count-1}})
			.filter(r => ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(r.name))
		let votes_0 = votes[0].count;
		let votes_1 = votes[1].count;
		let votes_2 = votes[2].count;
		let votes_3 = votes[3].count;
		let votes_4 = votes[4].count;
		let votes_5 = votes[5].count;

		if(count%2 == 0){
			embed.setAuthor({ name: '⬅️ Next reaction count', iconURL: 'https://i.pinimg.com/originals/37/52/0f/37520f15974a0100d7debbbd64f2bdef.gif'});
		} else {
			embed.setAuthor({ name: '⬅️ Next reaction count', iconURL: 'http://i.pinimg.com/originals/37/52/0f/37520f15974a0100d7debbbd64f2bdef.gif'});
		}
		//embed.setThumbnail('https://i.pinimg.com/originals/37/52/0f/37520f15974a0100d7debbbd64f2bdef.gif');
		embed.setFooter({ text: '⬅️ Next update | Session started ➡️', iconURL: 'http://i.pinimg.com/originals/37/52/0f/37520f15974a0100d7debbbd64f2bdef.gif' });
		embed.spliceFields(1, 1, {name: 'Voted Speed', value: `${votedspeed}/5`, inline: true});
		embed.spliceFields(2, 1, {name: 'Last Vote Result:', value: `0️⃣ = **${votes_0}**|1️⃣ = **${votes_1}** |2️⃣ = **${votes_2}** |3️⃣ = **${votes_3}** |4️⃣ = **${votes_4}** |5️⃣ = **${votes_5}**`, inline: false});
		let timestamp = Math.floor(Date.now() / 1000);
		if(count == 1){
			//embed.spliceFields(3, 1, {name: 'Session started:', value: `**<t:${timestamp}:R>**`, inline: true});
			embed.spliceFields(4, 1, {name: 'Reaction reset in:', value: `**<t:${timestamp+60}:R>**`, inline: true});
		}
		
		embed.spliceFields(3, 1, {name: 'Reaction count in:', value: `**<t:${timestamp+6}:R>**`, inline: true});

		if(count%12 == 0){
			await sessionMsg.reactions.removeAll();
			sessionMsg.react('0️⃣').catch(err => { console.error('0 one of the emojis failed to react.', err)} );
			sessionMsg.react('1️⃣').catch(err => { console.error('1 one of the emojis failed to react.', err)} );
			sessionMsg.react('2️⃣').catch(err => { console.error('2 one of the emojis failed to react.', err)} );
			sessionMsg.react('3️⃣').catch(err => { console.error('3 one of the emojis failed to react.', err)} );
			sessionMsg.react('4️⃣').catch(err => { console.error('4 one of the emojis failed to react.', err)} );
			sessionMsg.react('5️⃣').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
			sessionMsg.react('🔁').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
			sessionMsg.react('♒').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
			embed.spliceFields(4, 1, {name: 'Reaction reset in:', value: `**<t:${timestamp+60}:R>**`, inline: true});
		}
		//embed.spliceFields(6, 1, {name: 'Last Vote', value: `<@${config.userreacted[1].userid}> ${config.userreacted[1].reaction}`, inline: true});
		

			speed.shift();

			speed.push(votedspeed);
	
			CreateChart(interaction, config2, sessionMsg)
	

			//if(config.update_active == false) {
				//config.update_active = true
				//this.client.qonSessions.set(reaction.message.id, config);
				if(dev == false){
					LovenseConnect_send(
						config.discord_user_ids, speed, votedspeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
				}
				
				//embed.setImage('https://cdn.discordapp.com/attachments/790173243364737024/790228781704282132/file.jpg')
				
				//reaction.message.edit(embed);
				//reaction.users.remove(user.id);
				
				//config.update_active = false;
				//this.client.qonSessions.set(reaction.message.id, config);

			//}
		
		//message.reactions.forEach(reaction => reaction.remove(UserID))
		
		embed.setImage('https://cdn.discordapp.com/attachments/668775088593829899/1044626835058737233/image.png')

		sessionMsg.edit({embeds: [embed]});
		//let random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		//config.update_active = true;
		//.qonSessions.set(msg.id, config);
		//config.orgy = true;
		//clientqon.set(msg.id, config);

		let query = `UPDATE toycontrol SET toy_speed='${String(speed)}' WHERE discord_message_id='${interaction.applicationId}'`;
		let configquery = await getDataFromDB(query);
		let config = configquery[0];

		await sleep(5000);	
	}
}
const sleep = require('util').promisify(setTimeout)

async function CreateChart(interaction, config, sessionMsg){
	let speed = JSON.parse(config.toy_speed)
	//config.toy_speed.split(", ", 10);
	const width = 600;
	const height = 200;
	/**const chartCallback = (ChartJS) => {
		
		// Global config example: https://www.chartjs.org/docs/latest/configuration/
		ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
		// Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
		ChartJS.plugins.register({
			// plugin implementation
		});
		// New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
		ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
			// chart implementation
		});
	};*/
	//const canvasRenderService = new CanvasRenderService(width, height, chartCallback);
	
	/**const canvasRenderService = new ChartJSNodeCanvas( width, height, (ChartJS) => {
		ChartJS.plugins.register({
			beforeDraw: (chart, configuration) => {
				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = '#000000';
				ctx.fillRect(0, 0, width, height);
				ctx.restore();
			}
		});
	}
	);*/
	//const image = await canvasRenderService.renderToBuffer(configuration);
	const chartCallback = (ChartJS) => {
		// Global config example: https://www.chartjs.org/docs/latest/configuration/
		//ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
		ChartJS.defaults.font.family = 'Lato-Black';
		ChartJS.defaults.font.size = 16;
		ChartJS.defaults.font.weight = 'bold';
		ChartJS.defaults.color = `white`;
		//ChartJS.defaults.backgroundColor = 'rgba(255, 0, 102, 0.2)';
		//ChartJS.defaults.borderColor = 'rgba(255, 99, 132, 1)';
	};

	const textColor = `#FFFFFF`;
	const canvasRenderService = new ChartJSNodeCanvas({ width, height, chartCallback});

	(async () => {

		//var prevSpeeds = config.prevSpeed.join(', ');

		const configuration = {
			type: 'line',
			data: {
				labels: ['60', '55', '50', '45', '40', '35', '30', '25', '20', '15', '10', '5', 'now'],
				datasets: [{
					label: 'Control Timeline',
					data: [parseInt(speed[0]), parseInt(speed[1]), parseInt(speed[2]), parseInt(speed[3]), parseInt(speed[4]), parseInt(speed[5]), parseInt(speed[6]), parseInt(speed[7]), parseInt(speed[8]), parseInt(speed[9]), parseInt(speed[10]), parseInt(speed[11]), 0],
					backgroundColor: [
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)',
						'rgba(255, 0, 102, 0.2)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)',
						'rgba(255, 99, 132, 1)'
					],
					pointRadius: [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						5
					],
					borderWidth: 1,
					fill: true
				}]
			},
			options: {
				legend: {
					labels: {
						// This more specific font property overrides the global property
						color: 'rgb(255, 99, 132)'
					}
				},
				scales: {
					x: {
						ticks: {
							beginAtZero: false,
							//callback: (value) => value + 's ago'
						}
					},
					y: {
						min: 0,
						max: 5,
						ticks: {
							stepSize: 1,
							//callback: (value) => 'power ' + value
							callback: function(value, index, ticks) {
								return 'Power: ' + value;
							}
						}											
					}
				},
			},
		};
		//const image = await canvasRenderService.renderToBuffer(configuration);
		//const dataUrl = await canvasRenderService.renderToDataURL(configuration);
		canvasRenderService.registerFont('./assets/chartjsNodeCanvasFont/Lato-Black.ttf', { family: 'Lato-Black' });
		const image = canvasRenderService.renderToBufferSync(configuration );
		fs.writeFileSync(`charts/${sessionMsg.id}.png`, image);
		//const fs = require('fs')
		//const out = fs.createWriteStream(__dirname + '/test.png')
		//const stream = canvasRenderService.render()
		////out.on('finish', () =>  console.log('The PNG file was created.'))
		const exampleEmbed = new EmbedBuilder()
		.setTitle('Some title')
		.setImage(`attachment://${sessionMsg.id}.png`);


		const attachment = new AttachmentBuilder(image)
		//msg.channel.send({ embeds: [exampleEmbed], files: [attachment] }).then(setTimeout(() => msg.delete(), 5000));
	//const image = await canvas.renderToBuffer(configuration)
	})();

}


const reactionVoteCollector = async (interaction, config, sessionMsg) =>  {
	// Create a reaction collector
const filter = (reaction, user) => reaction.emoji.name === '1️⃣';
const collector = sessionMsg.createReactionCollector({ filter, time: 5000 });
collector.on('collect', r => {console.log(`Collected ${r.emoji.name}`);

});
collector.on('end', collected => {
	console.log(`Collected ${collected.size} items`);
	Lovense_ReactionVote(interaction, config, sessionMsg, collected);
	reactionVoteCollector (interaction, config, sessionMsg);
});
}

const reactionCollector = async (sessionMsg, interaction, config) =>  {
	config ="";
	let embed=";"
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
				
				if(config.session_mode =='orgy'){
					if(!config.discord_user_ids.includes(user.id))
						return reaction.users.remove(user.id);

					if(config.discord_user_ids.length == 1){
						interaction.client.qonSessions.delete(reaction.message.id);
						reaction.message.delete();
						collector2.stop();
						LovenseConnect.LovenseConnect_send([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
						return;
					}

					config.users.splice(config.users.indexOf(user.id), 1);
					LovenseConnect.LovenseConnect_send([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
					embed.spliceFields(1, 1, {name: "User / Toys", value: config.users.map(u => `<@${u}>`).join('\n'), inline: true})
					reaction.message.edit(embed);
				}else{
					if(user.id != config.users[0])
						return reaction.message.channel.send('You are not the creator of this session').then(msg => msg.delete({timeout: 5000}));

					LovenseConnect.LovenseConnect_send(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
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

									LovenseConnect.LovenseConnect_send(
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
							LovenseConnect.LovenseConnect_send(
								config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
							);
							break

						case '🔄':
							embed.spliceFields(5, 1, {name: 'Rotate', value: 'Anticlockwise', inline: true});
							config.rotACW = 1;
							LovenseConnect.LovenseConnect_send(
								config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
							);
							break;

						case '🔃':
							embed.spliceFields(5, 1, {name: 'Rotate', value: 'Clockwise', inline: true});
							config.rotCW = 1;
							LovenseConnect.LovenseConnect_send(
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
							LovenseConnect.LovenseConnect_send(
								config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
							);
							break;

						case '⬆':
							embed.spliceFields(4, 1, {name: 'Current AirPump(Max)', value: 'In', inline: true});
							config.airIn = 1;
							config.airOut = 0;
							LovenseConnect.LovenseConnect_send(
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
								LovenseConnect.LovenseConnect_send(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
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
	
	
								await interaction.message.react('0️⃣').catch(err => { console.error('0 one of the emojis failed to react.', err)} );
								await interaction.message.react('1️⃣').catch(err => { console.error('1 one of the emojis failed to react.', err)} );
								await interaction.message.react('2️⃣').catch(err => { console.error('2 one of the emojis failed to react.', err)} );
								await interaction.message.react('3️⃣').catch(err => { console.error('3 one of the emojis failed to react.', err)} );
								await interaction.message.react('4️⃣').catch(err => { console.error('4 one of the emojis failed to react.', err)} );
								await interaction.message.react('5️⃣').catch(err => { console.error('5 one of the emojis failed to react.', err)} );
								await interaction.message.react('⬆').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
								await interaction.message.react('⬇').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
								await interaction.message.react('⏸').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
								await interaction.message.react('🔄').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
								await interaction.message.react('🔃').catch(err => { console.error('✅ one of the emojis failed to react.', err)} );
								return interaction.channel.send('Session reset done, get the orgy started again').then(msg => msg.delete({timeout: 5000}));
								//break;
			
							case '❌':
								collector2.stop();
								return interaction.channel.send('Request canceled').then(msg => msg.delete({timeout: 5000}));
								//break;
						}
					}
					//LovenseConnect.LovenseConnect_send([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
				}
				//sql
				interaction.client.qonSessions.set(reaction.message.id, config);
			}
		}
	})

	collector2.on('dispose', reaction => interaction.channel.send(`Disposed ${reaction.emoji.name}, total is ${collector2.total}.`));
	collector2.on('end', collected2 => {
		//this.client.logger.info(`Collected ${collected.size} items`);
		//reaction.message.edit(embed);
		interaction.channel.send(embed);
	});
}