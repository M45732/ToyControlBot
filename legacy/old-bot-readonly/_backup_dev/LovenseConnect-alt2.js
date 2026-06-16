//const crypto = require('crypto');
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const lovenseConfig = yaml.load(fs.readFileSync(`./config/lovenseOptions.yml`, 'utf8'));
//const request = require('node-superfetch');
//const fetch = require('node-fetch');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const axios = require('axios');
//const md5 = require('md5');
const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Util } = require('discord.js');

const delay = async (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const sendToLovense = async (uIDarray = [], toy_speedLevel, prevSpeeds, message = "" , toy_RotateAntiClockwise , toy_RotateClockwise, toy_RotateStop, toy_AirIn, toy_AirOut) => {
		
	//pattern: pulse, wave, fireworks, earthquake

	// and now we send the api requests.
	var prevSpeed = prevSpeeds[10];
	switch (toy_speedLevel) {
		case 1:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 2:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 3:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 4:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		case 5:
			toy_speedLevel *= 4;
			prevSpeed *= 4;
			break;
		default:
			toy_speedLevel = 0;
			prevSpeed *= 4;
	}
	let uids = '';
	for(let uid of uIDarray){
		uids = uids+','+uid
	}
		//replace smoother with command pattern
		/** 			var smooth = 0;
		if (prevSpeed>toy_speedLevel){

			smooth = prevSpeed - toy_speedLevel;
			
		}else{
			smooth = toy_speedLevel - prevSpeed;
		}
			smooth = smooth / 2;
		
			for (let smoothsteps = 1; smoothsteps < smooth; smoothsteps++) {
				var smoother = 0
				if (prevSpeed>toy_speedLevel){
					smoother = prevSpeed - smoothsteps * 2;
				}else{
					smoother = prevSpeed + smoothsteps * 2;
				}
				let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${smoother}`;
				// sample {"result":true,"code":0}
				
				await request.post(url).then(async out => {
					if(!out.result)
						out = await request.post(url)
					//console.info(`Sending Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
					//console.info("Api response: ", out.text);
				})
			}
		*/
		//replace smoother with command pattern
		//let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
		let pattern = "";
		let speeddifference = 0;
		if(prevSpeed == toy_speedLevel){
			pattern = toy_speedLevel
		}else{
			if (prevSpeed>toy_speedLevel){
				speeddifference = prevSpeed-toy_speedLevel
				for(let step = 0; step < speeddifference;step++){
					if(step+1 == speeddifference){
						pattern = pattern + `${prevSpeed-step}`;
					}else{
						pattern = pattern + `${prevSpeed-step};`;
					}
				}
			}else{
				speeddifference = toy_speedLevel-prevSpeed
				for(let step = 0; step < speeddifference;step++){
					
					if(step+1 == speeddifference){
						pattern = pattern + `${prevSpeed+step}`;
					}else{
						pattern = pattern + `${prevSpeed+step};`;
					}
				}
			}
		}

		const result = await axios.post('https://apps.lovense.com/api/lan/v2/command',
		{
			token: `${lovenseConfig.token}`,  // Lovense developer token
			uid: uids,  // user id on your website
			//uname: uid, // user nickname on your website
			//utoken: md5(uid + 'Token@VibeMyToy.com'),  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
			/**  
			command:"Function",
			action:"Vibrate:2,Rotate:3,Pump:4",
			*/
/*"V:1;F:v,r,p;S:1000#"
V:1; Protocol version, this is static;
F:v,r,p; Features: v is vibrate, r is rotate, p is pump, this should match the strength below;
S:1000; Intervals in Milliseconds, should be greater than 100.
*/

			//toy_speedLevel+prevSpeed/2
			command :"Pattern",
			rule: "V:1;F:v;S:500#", 
			strength: `${pattern}`,
			timeSec: 5, 
			apiVer:2 
		})
		console.log(result)
			/**
				// Virbate the toy under the pattern you have define , The interval between changes is 1 second. the total time will be 9 seconds. 
			{
				command :"Pattern ",
				rule: "V:1;F:v;S:1000#", 
				strength:"20;20;5;20;10",    
				timeSec:9,                         
				toy:"ff922f7fd345",
				apiVer:1
			}*/
		/**
		let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=${toy_speedLevel}`;
		//sample {"result":true,"code":0}

		request.post(url).then(async out => {
			if(!out.result)
				out = await request.post(url)
			//console.info(`Sending Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			//console.info("Api response: ", out.text);
		}).catch(err => {
			console.log( 'Err: send',err );
		});

		if (toy_RotateAntiClockwise > toy_RotateClockwise && toy_RotateAntiClockwise > toy_RotateStop) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=${toy_speedLevel}`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation AntiClockwise on and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		if (toy_RotateClockwise > toy_RotateAntiClockwise && toy_RotateClockwise > toy_RotateStop) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateClockwise&v=${toy_speedLevel}`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation on and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		if (toy_RotateStop > toy_RotateAntiClockwise && toy_RotateStop > toy_RotateClockwise) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=0`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending Rotation off and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err ); 
			});
		} 
		
		if (toy_AirIn > toy_AirOut) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirIn`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		} 
		
		if (toy_AirOut > toy_AirIn) {
			url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirOut`;
			request.post(`${url}`).then( out => {
				//console.info(`Sending AirOut and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			}).catch(err => {
				console.log( 'Err',err );
			});
		}

		*/
	

	/*
	try {
		let toy = await request.post(`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uIDarray[0]}&command=GetToys`);
			//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			//Response Okay 2 Toys: {"result":true,"code":0,"message":"OK","data":{"c45b7455b8bd":{"nickName":"","name":"Hush","id":"c45b7455b8bd","battery":"-1","version":"","status":0},"da0ba2a74095":{"nickName":"","name":"R01","id":"da0ba2a74095","battery":"85","version":"","status":1}}}
			//						{"result":true,"code":0,"message":"OK","data":{"dc0d300b5b7f":{"id":"dc0d300b5b7f","status":"1","nickName":"Nora","name":"Nora","version":"","battery":64}}}
			//App running, no toys: {"result":true,"code":0,"message":"OK","data":{}}
			//App close: 			{"result": false, "code": 407, "message": "Lovense Connect is offline!"

		try {
			toy = JSON.parse(toy.body)
		} catch (e) {

		}
		if (toy.result = true){
			let connectedToys = []
			if(toy.data){
				for (let singletoy of Object.values(toy.data)) {
					
					if(singletoy.status === 1){
						connectedToys.push(singletoy.name);
						console.log(singletoy);
					}
				}
			}
			console.log(connectedToys);

			return connectedToys

		}
	}catch(err) {
		console.log( 'Err',err );
	}
	*/
}

const GetConnectedToysLovense = async (uid) => {
	try {

/** 
		const result = await axios.post('https://apps.lovense.com/api/lan/v2/command',
		{ 
			token: `${lovenseConfig.token}`,  // Lovense developer token
			uid: uid,  // user id on your website
			//uname: uid, // user nickname on your website
			//utoken: md5(uid + '234wedfe@dfgdgrc54'),  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
			command:"GetToys",         
			//apiVer:1
		})

		const result2 = await fetch("https://apps.lovense.com/api/lan/command", {
			method: "post",
			body: JSON.stringify(whatwewant),
			headers: { "Content-Type": "application/json" }
		})

		const body = await result2.body;
*/
		
		//https://api.lovense.com/api/lan/command
		//https://api.lovense.com/api/lan/v2/command
		//https://apps.lovense.com/api/lan/command
		
		//let toy = await request.post(`https://api.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=GetToys`);

		let toy = await axios.post('https://api.lovense.com/api/lan/command',
		{ 
			token: lovenseConfig.token,  // Lovense developer token
			uid: uid,  // user id on your website
			//uname: uID, // user nickname on your website
			//utoken: md5(uid + '234wedfe@dfgdgrc54')  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
		})

			//console.info(`Sending AirIn and Speed: ${toy_speedLevel} - Message: ${message} - UserID: ${uid}`);
			//Response Okay 2 Toys: {"result":true,"code":0,"message":"OK","data":{"c45b7455b8bd":{"nickName":"","name":"Hush","id":"c45b7455b8bd","battery":"-1","version":"","status":0},"da0ba2a74095":{"nickName":"","name":"R01","id":"da0ba2a74095","battery":"85","version":"","status":1}}}
			//App running, no toys: {"result":true,"code":0,"message":"OK","data":{}}
			//App close: 			{"result": false, "code": 407, "message": "Lovense Connect is offline!"

		toy = JSON.parse(toy.body);
		var connectedToys = [];
		if (toy.result == true){
			//let connectedToys = [];
			for (let singletoy of Object.values(toy.data)) {
				if(singletoy.status == 1){
					let battery = 0;
					if(singletoy.battery == -1){
						battery = 100;
					} else {
						battery = singletoy.battery;
					}
					connectedToys.push(`${singletoy.name}(🔋${battery}%)`);
					console.log(singletoy);
				}
			}
		}
		console.log(connectedToys);
		return connectedToys;
	}catch(err) {
		let connectedToys = ["appoffline"];
		return connectedToys;
	}
}

const loginLovense = async (client, lovenseConfig, message, interaction, orgy = 0, thread) => {
	let uid = interaction.member.id
	let uIDs = [];
	if (typeof uid == "string")
		uIDs = [uid]; // make 1 element array;
	else 
		uIDs.push(uid);

	let user = interaction.user;
	for(let uID of uIDs){
		if(uID != user.id)
			user = client.users.resolve(uID);

		//const result =  axios.post('https://api.lovense.com/api/lan/getQrCode', //funktioniert
		
		const result = await axios.post('https://api.lovense.com/api/lan/getQrCode',
		{ 
			token: lovenseConfig.token,  // Lovense developer token
			uid: uID,  // user id on your website
			uname: uID, // user nickname on your website
			//utoken: md5(uid + '234wedfe@dfgdgrc54')  // This is for your own verification purposes. We suggest you to generate a unique token/secret for each user. This allows you to verify the user and avoid others faking the calls.
		})
			
		let img = result.data.message;
		//.setDescription("You have been added to the Lovense play session")
		//.setThumbnail(img)
		const qrcodeMessage = new EmbedBuilder()
		.addFields({name: "1. Download App", value: "Download / open the Lovense Remote app([Andriod](https://play.google.com/store/apps/details?id=com.lovense.remote) / [iOS](https://play.google.com/store/apps/details?id=com.lovense.remote)) or **even better** the Lovense Connect app ([Android](https://play.google.com/store/apps/details?id=com.lovense.connect) / [iOS](https://itunes.apple.com/us/app/lovense-connect/id1273067916))"})
		.addFields({name: "2. Connect Toy(s)", value: "Connect your toy(s) to the app"})
		.addFields({name: "3. Scan QR code", value: "Scan the following QR code with the Lovense Remote / Connect app"})
		.setImage(img);
		
		if(orgy != 0){
			if(client.lovense.panel.length > 4)
				client.lovense.panel.edit({embeds: [qrcodeMessage]}).catch(e => console.error(e));
			else 
				message.member.send({embeds: [qrcodeMessage]}).catch(e => console.error(e));
		}else{
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

			//await interaction.reply({ content: 'Pong!', components: [row] });
			await interaction.editReply({embeds: [qrcodeMessage], components: [row], ephemeral: true}).catch(err => console.error(`SEND EMBED to ${user}:`,err));
			//console.info(`Logging ${user} from discord to lovense connect.`);
		}
	}
}

const logoutLovense = async (client, lovenseConfig, message) => {
	let uids = [];
	let uid = 0;
	if (typeof lovenseConfig.uid == 'string')
		uids = [lovenseConfig.uid];
	else 
		uids = lovenseConfig.uid;
	
	//there should be the logout sequence to connect lovense with
	for (let i = 0; i< uids.length;i++) {
		uid = uids[i];
		/** 
		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		// this one also could be used with request.post.then.catch system ( see node-prefetch)
		let url=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=Vibrate&v=0`;
		console.log("Logout",url);
		let { output } = request
		.post(`${url}`)
		.then( out => {
			console.info(`Sending Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err: send',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_air=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=AirOut`;
		console.log(url_air);
		let { output_air } = request
		.post(`${url_air}`)
		.then( out => {
			console.info(`Sending AirOut: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_antirotate=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateAntiClockwise&v=0`;
		console.log(url_antirotate);
		let { output_antirotate } = request
		.post(`${url_antirotate}`)
		.then( out => {
			console.info(`Sending Rotation off and Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});

		await LovenseConnect.delay(500); // Pausiert die Funktion für 3 Sekunden
		let url_rotate=`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uid}&command=RotateClockwise&v=0`;
		console.log(url_rotate);
		let { output_rotate } = request
		.post(`${url_rotate}`)
		.then( out => {
			console.info(`Sending Rotation off and Speed: 0 - Message: ${message} - UserID: ${uid}`);
		})
		.catch(err => {
			console.log( 'Err',err );
		});
*/
	}
	//console.info(`Logging out discord to lovense.`);
	client.lovense.panel = false;
	if ( client.lovense.collector ) { 
		client.lovense.collector.close();
	}
	lovenseConfig = lovenseConfig.filter(item => item !== message.id)
}


const ReactionCollectorLovense = async (interaction, type, subcommand, uid, message, stop, orgy, controlee) => {
	const filter = i => i.customId === 'lovenselogin' && i.user.id === interaction.user.id;

	const collector = interaction.channel.createMessageComponentCollector({ filter });

	collector.on('collect', async i => {

		//const emoji = reaction.emoji.name;
		const embed = EmbedBuilder.from(i.message.embeds[0]);

		sessionMsg = i.message;

		switch(i.customId){

			case 'lovenselogin': {
				
				interaction.client.qonSessions.set(sessionMsg.id, {channelid : interaction.channel.id, curSpeed: 0, prevSpeed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rotACW: 0, rotCW: 0, rotStop: 0, airIn: 0, airOut: 0, update_active: false, users: [interaction.member.id], userreacted: [{userid: 0, reaction: 0}], orgy: orgy});
				let config = interaction.client.qonSessions.get(i.message.id)

				if(!config.users.includes(interaction.user.id) && config.orgy){
					let toy = await sendToLovense(
						interaction.user.id, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
				} else {
					/*
					let toy = await LovenseConnect.sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);*/
				}


				let toy = await GetConnectedToysLovense(i.user.id);
				//toy = await request.post(`https://apps.lovense.com/api/lan/command?token=${lovenseConfig.token}&uid=${uIDarray[0]}&command=GetToys`);
				if(toy.length > 0  && toy[0] !="appoffline"){

					// now setup
					lovenseConfig.uids = uid;
					
					let toy = await GetConnectedToysLovense(interaction.member.id);

					const emojiCharacters = lovenseConfig.reactionNumbers;
					const lovenseEmbedThread = new EmbedBuilder();
					const lovenseEmbed = new EmbedBuilder();
					lovenseEmbed.setTitle(`${type} ${subcommand} session`);
					lovenseEmbed.setDescription(message);
					//lovenseEmbed.setAuthor(interaction.user.username, interaction.user.avatarURL({dynamic: true}));
					//lovenseEmbed.setThumbnail(interaction.user.displayAvatarURL({extension: "jpg", size: 128}));
					//.addField('Default level', lovenseConfig.toy_default_level, true)
					lovenseEmbedThread.addFields({name: 'Available reactions', value: '❌ = End / leave the session (Controlled User only)\n:zero: to :five: = Vibration Speed\n:arrow_up: = Max air in\n:arrow_down: = Max air out\n:pause_button: = Nora rotate stop\n:arrows_counterclockwise: = Nora rotate anti-clockwise\n:arrows_clockwise: = Nora rotate clockwise'});

					if(toy.length > 0  && toy[0] !="appoffline") {
						if(subcommand == "orgy" ){
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
							lovenseEmbed.addFields({name: 'User', value: `${interaction.member}`, inline: true});
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
					}else{
						sessionMsg = await interaction.channel.send({embeds: [lovenseEmbed], components: [row]}).then(
							//sentMessage => interaction.client.lovense.panel = sentMessage
							);
						//create thread here
						//type: 'GUILD_PRIVATE_THREAD',
						//const thread = channel.threads.cache.find(x => x.name === 'food-talk');
						//await thread.members.add('140214425276776449');
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
								if(config.orgy){
									if(!config.users.includes(user.id))
										return reaction.users.remove(user.id);

									if(config.users.length == 1){
										interaction.client.qonSessions.delete(reaction.message.id);
										reaction.message.delete();
										collector2.stop();
										sendToLovense([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
										return;
									}

									config.users.splice(config.users.indexOf(user.id), 1);
									sendToLovense([user.id], 0, 0, 'down', 0, 0, 1, 0, 0);
									embed.spliceFields(1, 1, {name: "User / Toys", value: config.users.map(u => `<@${u}>`).join('\n'), inline: true})
									reaction.message.edit(embed);
								}else{
									if(user.id != config.users[0])
										return reaction.message.channel.send('You are not the creator of this session').then(msg => msg.delete({timeout: 5000}));
			
									sendToLovense(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
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
													interaction.client.qonSessions.set(reaction.message.id, config);
													embed.spliceFields(3, 1, {name: 'Current Power', value: `${config.curSpeed}/5`, inline: true});
													//reaction.message.edit(embed);		

													sendToLovense(
														config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
													);

													//embed.setImage('https://cdn.discordapp.com/attachments/790173243364737024/790228781704282132/file.jpg')
													//embed.spliceFields(6, 1, {name: 'Last Vote', value: `<@${config.userreacted[1].userid}> ${config.userreacted[1].reaction}`, inline: true});
													reaction.message.edit(embed);
													reaction.users.remove(user.id);
													config.userreacted = config.userreacted.filter(item => item.userid !== reaction.user.id);
													config.update_active = false;
													return interaction.client.qonSessions.set(reaction.message.id, config);
												}
											}, 5000);
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
											sendToLovense(
												config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
											);
											break
			
										case '🔄':
											embed.spliceFields(5, 1, {name: 'Rotate', value: 'Anticlockwise', inline: true});
											config.rotACW = 1;
											sendToLovense(
												config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
											);
											break;
			
										case '🔃':
											embed.spliceFields(5, 1, {name: 'Rotate', value: 'Clockwise', inline: true});
											config.rotCW = 1;
											sendToLovense(
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
											sendToLovense(
												config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
											);
											break;
			
										case '⬆':
											embed.spliceFields(4, 1, {name: 'Current AirPump(Max)', value: 'In', inline: true});
											config.airIn = 1;
											config.airOut = 0;
											sendToLovense(
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
												sendToLovense(config.users, 0, 0, 'down', 0, 0, 1, 0, 0);
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
		const emoji = reaction.emoji.name;
		const embed = EmbedBuilder.from(reaction.message.embeds[0]);
		let config = interaction.client.qonSessions.get(reaction.message.id)

		let highestEmojiSpeed = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
			.sort((a, b) => b.count - a.count)
			.filter(r => ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(r.name))[0]
		
		let speed = highestEmojiSpeed ? parseInt(highestEmojiSpeed.name.charAt(0)) : undefined;
		/*
		if(speed != undefined && config.prevSpeed != speed){
			config.curSpeed = speed;
			config.prevSpeed = config.curSpeed
			setTimeout(() => { 
				if(config.update_active == false) {
					config.update_active = true
					this.client.qonSessions.set(reaction.message.id, config);
					embed.spliceFields(3, 1, {name: 'Current Speed', value: `${config.curSpeed}/5`, inline: true});
					reaction.message.edit(embed);

					LovenseConnect.sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					config.update_active = false
					this.client.qonSessions.set(reaction.message.id, config);
				}}, 1000);
			return this.client.qonSessions.set(reaction.message.id, config);
		}
		*/


		let highestEmojiRotate = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
			.sort((a, b) => b.count - a.count)
			.filter(r => ['⏸', '🔃', '🔄'].includes(r.name))[0]		

		let rotate = highestEmojiRotate ? highestEmojiRotate.name : undefined;
		if(rotate != undefined){
			switch(rotate){
				case '⏸':
					embed.spliceFields(5, 1, {name: 'Rotate', value: 'none', inline: true});
					config.rotStop = 1;
					sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					break

				case '🔄':
					embed.spliceFields(5, 1, {name: 'Rotate', value: 'Anticlockwise', inline: true});
					config.rotACW = 1;
					sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					break;

				case '🔃':
					embed.spliceFields(5, 1, {name: 'Rotate', value: 'Clockwise', inline: true});
					config.rotCW = 1;
					sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					break;
			}
		}



		let highestEmojiAir = reaction.message.reactions.cache.map(r => {return {name: r.emoji.name, count: r.count}})
			.sort((a, b) => b.count - a.count)
			.filter(r => ['⬇', '⬆'].includes(r.name))[0]

		let air = highestEmojiAir ? highestEmojiAir.name : undefined;
		if(air != undefined){
			switch(air){
				case '⬇':
					embed.spliceFields(4, 1, {name: 'Air', value: 'Out', inline: true});
					config.airOut = 1;
					config.airIn = 0;
					sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					break;

				case '⬆':
					embed.spliceFields(4, 1, {name: 'Air', value: 'In', inline: true});
					config.airIn = 1;
					config.airOut = 0;
					sendToLovense(
						config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
					);
					break;

			}
		}
		reaction.message.edit(embed);
		interaction.client.qonSessions.set(reaction.message.id, config);
	});
}

async function testrun(msg, config, clientqon) {
	//let config = this.client.qonSessions.find(obj => obj.users.includes(msg.author.id));
	let count = 0;
	while (stop == false) {
		count++;
		//msg.channel.send('5s message update');
		//let config = this.client.qonSessions.get(msg.id);
		//let config = this.client.qonSessions.find(obj => obj.users.includes(msg.author.id));
		config.prevSpeed.shift();

		config.prevSpeed.push(config.curSpeed);
		//config.curSpeed = speed


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
						data: [config.prevSpeed[0], config.prevSpeed[1], config.prevSpeed[2], config.prevSpeed[3], config.prevSpeed[4], config.prevSpeed[5], config.prevSpeed[6], config.prevSpeed[7], config.prevSpeed[8], config.prevSpeed[9], config.prevSpeed[10], config.prevSpeed[11], config.curSpeed],
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
			fs.writeFileSync(`charts/${msg.id}.png`, image);
			//const fs = require('fs')
			//const out = fs.createWriteStream(__dirname + '/test.png')
			//const stream = canvasRenderService.render()
			////out.on('finish', () =>  console.log('The PNG file was created.'))
			const exampleEmbed = new EmbedBuilder()
			.setTitle('Some title')
			.setImage(`attachment://${msg.id}.png`);


			const attachment = new AttachmentBuilder(image)
			//msg.channel.send({ embeds: [exampleEmbed], files: [attachment] }).then(setTimeout(() => msg.delete(), 5000));
		//const image = await canvas.renderToBuffer(configuration)
		})();

		const embed = EmbedBuilder.from(msg.embeds[0]);

		embed.spliceFields(3, 1, {name: 'Current Speed', value: `${config.curSpeed}/5`, inline: true});
		let timestamp = Math.floor(Date.now() / 1000);
		if (count%2 == 0){
			//embed.setFooter({text: "seconds until next vote", iconURL: "https://im2.ezgif.com/tmp/ezgif-2-c31cc34c6686.gif"});
			embed.spliceFields(6, 1, {name: 'Next vote in:', value: `**<t:${timestamp+6}:R>**`, inline: false});
			//msg.embeds[0].data.fields[6] = 	{name: 'Next vote in:', value: `**<t:${timestamp+31}:R>**`, inline: false}
			//embed.setFooter({text: `seconds until next vote! **<t:${timestamp+31}:R>**`})
		} else{
			//embed.setFooter({text: "seconds until next vote!", iconURL: "https://im2.ezgif.com/tmp/ezgif-2-c31cc34c6686.gif"});
			embed.spliceFields(6, 1, {name: 'Next vote in:', value: `**<t:${timestamp+6}:R>**`, inline: false});
			//embed.setFooter({text: `seconds until next vote! **<t:${timestamp+31}:R>**`});
		}

		let votes_0 = 0;
		let votes_1 = 0;
		let votes_2 = 0;
		let votes_3 = 0;
		let votes_4 = 0;
		let votes_5 = 0;
		for (let i=1; i<config.userreacted.length; i++) {

			const userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(config.userreacted[i].userid));
			try {
				for (const reaction of userReactions.values()) {
					
					switch(reaction._emoji.name){
						case '0️⃣':
							votes_0 = votes_0+1;
							break;
						case '1️⃣':
							votes_1 = votes_1+1;
							break;
						case '2️⃣':
							votes_2 = votes_2+1;
							break;
						case '3️⃣':
							votes_3 = votes_3+1;
							break;
						case '4️⃣':
							votes_4 = votes_4+1;
							break;
						case '5️⃣':
							votes_5 = votes_5+1;
							break;
					}
					
					await reaction.users.remove(config.userreacted[i].userid);
				}
			} catch (error) {
				console.error('Failed to remove reactions.');
			}
			config.userreacted = config.userreacted.filter(item => item.userid !== config.userreacted[i].userid);

		}
		embed.spliceFields(3, 1, {name: 'Current Speed', value: `${config.curSpeed}/5`, inline: true});
		embed.spliceFields(6, 1, {name: 'Vote result:', value: `0️⃣=${votes_0} | 1️⃣=${votes_1} | 2️⃣=${votes_2} | 3️⃣=${votes_3} | 4️⃣=${votes_4} | 5️⃣=${votes_5}`, inline: true});
			//embed.spliceFields(6, 1, {name: 'Last Vote', value: `<@${config.userreacted[1].userid}> ${config.userreacted[1].reaction}`, inline: true});
		
			//if(config.update_active == false) {
				//config.update_active = true
				//this.client.qonSessions.set(reaction.message.id, config);
				
				

				sendToLovense(
					config.users, config.curSpeed, config.prevSpeed, 'down', config.rotACW, config.rotCW, config.rotStop, config.airIn, config.airOut
				);
				
		
				//embed.setImage('https://cdn.discordapp.com/attachments/790173243364737024/790228781704282132/file.jpg')

				
				//reaction.message.edit(embed);
				//reaction.users.remove(user.id);
				
				//config.update_active = false;
				//this.client.qonSessions.set(reaction.message.id, config);

				
			//}
		
		

		//message.reactions.forEach(reaction => reaction.remove(UserID))
		
		embed.setImage('https://cdn.discordapp.com/attachments/668775088593829899/1044626835058737233/image.png')

		embed.spliceFields(4, 1, {name: 'Last Vote', value: `test`, inline: true});
		msg.edit({embeds: [embed]});
		
		let random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		//config.update_active = true;
		//.qonSessions.set(msg.id, config);
		config.orgy = true;
		clientqon.set(msg.id, config);

		await sleep(5000);	
	}
}

const sleep = require('util').promisify(setTimeout)

module.exports =  {
	sendToLovense,
	loginLovense,
	GetConnectedToysLovense,
	logoutLovense,
	ReactionCollectorLovense,
	testrun
}
