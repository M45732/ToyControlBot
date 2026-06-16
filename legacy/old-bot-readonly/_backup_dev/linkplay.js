const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Command = require('../structures/Command');
const {Headers} = require('node-fetch');


module.exports = {

	name: 'trustplay',
	group: 'lovense',
	description: `Gives you some neat time for your anonymous lovense link.`,
	format: '/selfplay',
	examples: ['selfplay https://api2.lovense.com/c/me01'],
	details: `The argument must be an valid anonymous lovense link.\nOnly the privileged users may use this command.`,
	options: [
	{
		name: 'url',
		type: ApplicationCommandOptionType.String,
		description: 'What anonymous link you want to check?',
		required: true,
	}],
/** 
	hasPermission (msg) {
		if (!msg.guild) { return this.client.isOwner(msg.author) }
			return true;
	}
*/
	async run (msg, {url}) {

		let client = msg.client;
		let testMode = false;

		if(url == 'test' && msg.author.id == '474971440177741826') 
			testMode = true;//Myth

		/// initial check, if we already have a playing queue, we should skip this one.
		if(!client.lovensePlay)
			client.lovensePlay = {active: false};
		
		//else {
		//	let ret = true;
		//	client.lovensePlay.toy_id.forEach(async id => {
		//		ret |= await lovenseSendAnonymousPush(client.lovensePlay.session || 'none', id || 'a', `0,0,0`, client.lovensePlay.cookieSet || {});  
		//		await client.sleep(500);
		//	})
		//	if (ret === false)  { 
		//		// we have to stop. Thank the player and close it.
		//		//client.lovensePlay.message.edit(`Thanks for playing. Session ended.`).catch(oO => {});
		//		client.lovensePlay.active = false;
		//	} else {
		//		if (ret.result === false ) {
		//			//client.lovensePlay.message.edit(`Thanks for playing. Session ended. [${ret.message}]`).catch(oO => {});;
		//			client.lovensePlay.active = false;
		//		}
		//	} 
		//}

		if(!testMode)
			if(client.lovensePlay.active === true ){
				// here we shall check if previous link is still active. 
				await msg.member.send(`I am sorry, the bot is already busy for link play. Wait until current session ends.`)
				.catch( e => msg.channel.send(`Sorry ${msg.member.nickname || msg.member.tag}, the play engine is busy. Try later.`).catch(err => undefined));
				msg.delete().catch(oO => undefined)
				return;
			}

		let message = await msg.channel.send(`Loading Engine... Keep calm and wait.`);
		let cookieSet = '';
		//now we check the URL status
		//then reply, by editing the message.
		try {
			let lovenseData = await this.client.getLovenseLinkStatus(url);
			//Preparations: 
			// we NEED: 
			// SESSION
			let session = 'SESSION';
			// TOY
			let toy = [];
			let toy_id = [];
			//let plays = {};
			client.lovensePlay = {
				'data': lovenseData,
				'url': url,
				'message': message,
				'msg': msg,
				'current_level': 0,
				'previous_level': 0,
				'status': true
			};

			if (testMode) {
				lovenseData = {
					status: true, 
					message: 'Test mode ON',
					plays: [
						{ toy: 'TEST',toy_id: 'eeef042836e8', session: 'a44bedafd90c45c2ba8e3b0cf1f6d442'}
					]
				}
			}

			if (lovenseData.status === false) {
				console.log(lovenseData);
				cookieSet = lovenseData.cookie || '';
				await message.edit(lovenseData.message||'Invalid Link provided.').then(e =>{
					client.lovensePlay = {
						'data': lovenseData,
						'url': url,
						'status': false,
						'active': false
					}

					setTimeout(() => {
						e.delete().catch(err => undefined);
						msg.delete().catch(err => undefined);
					}, 30000);
				}).catch(o => {});

				return;
			} else {
				await message.edit(`${lovenseData.message}`);
				lovenseData.plays.forEach(p => {
					console.log(p);
					toy.push(p.toy);
					toy_id.push(p.toy_id);
					session = p.session;
				});
			}

			// msg.delete().catch(err => undefined);
			// now we start.
			client.lovensePlay.active = true;
			client.lovensePlay.toy = toy.join(',') || 'Online';
			client.lovensePlay.toy_id = toy_id;
			client.lovensePlay.session = session;
			client.lovensePlay.message = message ||null;
			client.lovensePlay.cookieSet=cookieSet;
			client.user.setActivity(`Lovense Play mode : ON! Playing ${client.lovensePlay.toy}.`);
			let x = await lovenseStartAnonymousPush(session, cookieSet);
			console.log('Init start',x);

			// HERE IS THE QUEUE PLAY
			const emojiCharacters = ['\u0030\u20E3','\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '\u0036\u20E3','\u0037\u20E3','\u0038\u20E3','\u0039\u20E3'];
			//SETTING THE REACTIONS SET:
			await msg.react('\u274C'); // ❌ Poster should be able to 'close' the connection
			await msg.react(emojiCharacters[0]).catch(err=> { console.error('0 one of the emojis failed to react.', err)} );
			await msg.react(emojiCharacters[1]).catch(err=> { console.error('1 one of the emojis failed to react.', err)} );
			await msg.react(emojiCharacters[2]).catch(err=> { console.error('2 one of the emojis failed to react.', err)} );
			await client.sleep(1000);
			await msg.react(emojiCharacters[3]).catch(err=> { console.error('3 one of the emojis failed to react.', err)} );
			await msg.react(emojiCharacters[4]).catch(err=> { console.error('4 one of the emojis failed to react.', err)} );
			await msg.react(emojiCharacters[5]).catch(err=> { console.error('5 one of the emojis failed to react.', err)} );
			// sanity check ;)
			await client.sleep(1000);

			//NOW THE COLLECTOR:
			// we do 'last on, working currently.'
			const collector = msg.createReactionCollector((reaction, user) => 
				user.id === msg.author.id &&
				reaction.emoji.name === emojiCharacters[0] ||
				reaction.emoji.name === emojiCharacters[1] ||
				reaction.emoji.name === emojiCharacters[2] ||
				reaction.emoji.name === emojiCharacters[3] ||
				reaction.emoji.name === emojiCharacters[4] ||
				reaction.emoji.name === emojiCharacters[5] ||
				reaction.emoji.name === '\u274C' ||		//❌
				reaction.emoji.name === '\u1F504' ||	//🔄
				reaction.emoji.name === '\u1F503' ||	//🔃
				reaction.emoji.name === '\u2B06' ||		//⬆
				reaction.emoji.name === '\u2B07',		//⬇
				{ dispose: true }
			);

			// COLLECT
			collector.on('collect', async (reaction, reactionCollector) => {
				console.log('Collect:', reaction.emoji.name, 'From ', reactionCollector.tag);
				const chosen = reaction.emoji.name;
				// console.log( 'Collection',reactionCollector);
				//console.log('Current:', reaction.reactions);
				let out = reaction.message.reactions.cache.map(r =>  `${r.emoji.name}:${r.count}`);
				out = out.sort();
				// THE HIGHEST SPEED IS EVALUATED from reaction.msg. count. 
				let current = client.lovensePlay.current_level | 0;
				for (let i = 0 ; i< out.length; ++i) {
					let o = out[i].split(':');
					let x = emojiCharacters.indexOf(o[0]);
					if(x >= 0) {
						if (chosen == o[0]) {
							current = x;
						}
					}
				}

				// WE SHOULD NOT COUNT BOT REACTIONS to change the effect:
				if (chosen === '\u274C') {	//❌
					// uid.push(reacted user id ) and send login to him.
					// console.log('Reaction: ', reaction.message.author.id, 'Collector: ', reactionCollector.id);
					current = 0;
					client.lovensePlay.current_level = 0;
					client.lovensePlay.previous_level = 0; 
					let ret = true;
					//closing the session by request. 

					client.lovensePlay.toy_id.forEach(async id => {
						ret |= await lovenseSendAnonymousPush(client.lovensePlay.session, id, `0,0,0`, cookieSet);
						await client.sleep(500);
					});
					// By bye cruel world. We enforce closing if owner clicks it.
					if (reaction.message.author.id == reactionCollector.id) {
						await client.lovensePlay.message.edit(`( ${client.lovensePlay.toy} ) STOP requested by controlee. Thank you.`);
						client.lovensePlay = { active: false, status: false };
						collector.stop();
						return;
					}

					await client.lovensePlay.message.edit(`( ${client.lovensePlay.toy} ) Slowdown requested. Power is set to zero.`);
					return;
				}

				if ( current !== client.lovensePlay.current_level) {
					client.lovensePlay.previous_level = client.lovensePlay.current_level;
					client.lovensePlay.current_level = current;
					let ret = true;

					client.lovensePlay.toy_id.forEach(async id => {
						ret |= await lovenseSendAnonymousPush(client.lovensePlay.session, id, `${current * 4},0,0`, cookieSet);
						await client.sleep(500);
					});
					await client.lovensePlay.message.edit(`Toy ( ${client.lovensePlay.toy} ) power is set to: ${emojiCharacters[current]} `);
					client.lovensePlay.apiReturn = ret;
					//LovenseConnect.sendToLovense(uid,conf.toy_current_speed, 'play', conf.toy_RotateAntiClockwise, conf.toy_RotateClockwise, conf.toy_RotateStop, conf.toy_AirIn, conf.toy_AirOut);
					if (ret === false) {
						// we have to stop. Thank the player and close it.
						await client.lovensePlay.message.edit(`Thanks for playing. Session ended.`);
						client.lovensePlay.active = false;
						collector.stop();
					} else {
						if (ret.result === false) {
							client.lovensePlay.active = false;
							await client.lovensePlay.message.edit(`Thanks for playing. Session ended. [${ret.message}]`);
							collector.stop();
						}
					}
				}

				//console.info(`Collect Add : ${chosen}`, client.lovensePlay);
			});

			//collector.on('remove', reaction => msg.channel.send(`Removed ${reaction.emoji.name}, total is ${collector.total}.`));
			collector.on('remove', async (reaction, reactionCollector) => {

			// Now... recalculation or simply go to the previous speed: conf.toy_previous_speed
			const chosen = reaction.emoji.name;
			let out = reaction.message.reactions.cache.map(r =>  `${r.emoji.name}:${r.count}`);
			out = out.sort();

			// THE HIGHEST SPEED IS EVALUATED from reaction.msg. count. 
			let current = 0;
			for (let i = 0 ; i< out.length; ++i) {
				let o = out[i].split(':');
				let x = emojiCharacters.indexOf(o[0]);
				if(x >= 0) {
					if (chosen == o[0]) {
						current = x;
					}
				}
			}

			client.lovensePlay.toy_remove_current_max=current;

			if (chosen === '\u274C') {	//❌
				// uid.push(reacted user id ) and send login to him.
				//console.log('closing',reaction);
				client.lovensePlay.current_level = 0;
				client.lovensePlay.previous_level = 0; 
				let ret = true;
				client.lovensePlay.toy_id.forEach(async id => {
					ret |= await lovenseSendAnonymousPush(client.lovensePlay.session, id, `0,0,0`, cookieSet);   
					await client.sleep(500);
				})
				if (reaction.message.author.id == reactionCollector.id ) {
					collector.stop();
					await client.lovensePlay.message.edit(`( ${client.lovensePlay.toy} ) STOP already requested by controlee. Generate a new link if you want to start over.`);
					client.lovensePlay = {active:false, status: false, message: client.lovensePlay.message};
					// we still END it. 
					return;
				}

				await client.lovensePlay.message.edit(`( ${client.lovensePlay.toy} ) Slowdown requested. Power is set to zero.`);
				if (ret === false)  { 
					// we have to stop. Thank the player and close it.
					await client.lovensePlay.message.edit(`Thanks for playing. Session ended.`);
					client.lovensePlay.active = false;
					collector.stop();
				} else {
					if (ret.result === false ) {
						await client.lovensePlay.message.edit(`Thanks for playing. Session ended. [${ret.message}]`);
						client.lovensePlay.active = false;
						collector.stop();
					}
				}
				// By bye cruel world. We enforce closing if owner clicks it.
				return;
			}

			//this will switch to the previous level.
			if (current !== client.lovensePlay.previous_level) {
				current = client.lovensePlay.previous_level;
				client.lovensePlay.current_level = current;
				client.lovensePlay.previous_level = 0; // a fall back to stop if two no no reactions follows.
				let ret = true;
				// LovenseConnect.sendToLovense(uid,conf.toy_current_speed, 'previous power', conf.toy_RotateAntiClockwise, conf.toy_RotateClockwise, conf.toy_RotateStop, conf.toy_AirIn, conf.toy_AirOut);
				client.lovensePlay.toy_id.forEach(async id => {
					let ret = await lovenseSendAnonymousPush(client.lovensePlay.session, id, `${current * 4},0,0`, cookieSet);
					await client.sleep(500);
				});
				await client.lovensePlay.message.edit(`Toy ( ${client.lovensePlay.toy} ) power is set to previous: ${emojiCharacters[current]} `);
				client.lovensePlay.apiReturn=ret;
				if (ret === false)  { 
					// we have to stop. Thank the player and close it.
					await client.lovensePlay.message.edit(`Thanks for playing. Session ended.`);
					client.lovensePlay.active = false;
					collector.stop();
				} else {
					if (ret.result === false ) {
						await client.lovensePlay.message.edit(`Thanks for playing. Session ended. [${ret.message}]`);
						client.lovensePlay.active = false;
						collector.stop();
					}
				}
			}

			console.info(`Collect Remove: ${chosen} by ${reactionCollector.tag}`);
			});

			collector.on('dispose', reaction => msg.channel.send(`Disposed ${reaction.emoji.name}, total is ${collector.total}.`));
			collector.on('end', collected => {
				console.log(`Collected ${collected.size} items`);
			});

			///////// QUEUE END //////////
		} catch (err) {
			message.edit('Error!\n```'+ err +'```');
		}
	}
}


async function lovenseStartAnonymousPush(session, cookieSet ='') {
	const requestOptions = {
		redirect:'manual', 
		follow: 0,
		compress: false,
		encoding: 'utf8',
	};
	const request = require('node-superfetch');
	let timestamp = Math.floor(Date.now() / 1000);
	let baseURL = `https://api2.lovense.com/app/ws/play/${session}?_=${timestamp}`
	let baseURL2 = `https://api2.lovense.com/app/ws2/play/${session}`
	try {
		const {headers,body,text} = await request.get(baseURL, requestOptions);
		if (headers) cookieSet= headers['set-cookie'] || cookieSet;	
		const {headers2,body2,text2} = await request.get(baseURL2, requestOptions);
		if (headers2) cookieSet= headers2['set-cookie'] || cookieSet;
		return true;
	} catch (e) {
		console.log('Start Error',e);
		return e;
	}
}
async function lovenseSendAnonymousPush(session, toy_id, values, cookieSet='') {
	const meta = {
		'Sec-Fetch-Mode': 'cors',
		'Sec-Fetch-Site': 'same-origin',
		'DNT':1,
		'Accept-Encoding': 'gzip, deflate,br',
		'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6,bg;q=0.5,da;q=0.4,de;q=0.3,el;q=0.2,es;q=0.1,fi;q=0.1,fr;q=0.1,he;q=0.1,hu;q=0.1,it;q=0.1,nb;q=0.1,nl;q=0.1,pl;q=0.1,pt;q=0.1,sk;q=0.1,sv;q=0.1,tr;q=0.1,zh-CN;q=0.1,zh;q=0.1,co;q=0.1,eu;q=0.1',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': '*/*',
		'Referer': `https://api2.lovense.com/app/ws2/play/${session}`,
		'X-Requested-With': 'XMLHttpRequest',
		'Connection': 'keep-alive',
		'Origin': 'https://api2.lovense.com'
	};

	if (cookieSet) {
		meta.Cookie = cookieSet;
	}
	const headers = new Headers(meta);
	const requestOptions = {
		redirect:'manual', 
		follow: 0,
		compress: false, 
		headers: headers,
		encoding: 'utf8',
	};
	/** 
	post : order: {'cate':'id','id':{'TOY_ID':{'v':1,'p':0,'r':0}}}
	**/ 

	const request = require('node-superfetch');
	let timestamp = Math.floor(Date.now() / 1000);
	let baseURL = `https://api2.lovense.com/app/ws/command/${session}`
	//let baseURL2 = `https://api2.lovense.com/app/ws/sendCommand/${session}`
	let val = values.split(',');
	let vibration=Math.floor(val[0])||0;
	let pulse=Math.floor(val[1])||0;
	let rotate = Math.floor(val[2])||0;
	vibration = Math.min(vibration,20);
	//vibration = Math.min(vibration,5); ///LIMITING TO <=5 for tests ( actually should be min of vibration*4 <=20 )
	let raw = `order={'cate':'id','id':{'${toy_id}':{'v':${vibration},'v1':${vibration},'v2':${vibration},'p':${pulse},'r':${rotate}}}}`;
	//let raw2 = `order={'cate':'id','id':{'${toy_id}':{'v':${vibration},'v1':${vibration},'v2':${vibration},'p':${pulse},'r':${rotate}}}}`;
	requestOptions.body=raw;

	try {
		const {body, text, headers} = await request.post(baseURL, requestOptions);
		//console.log(baseURL,cookieSet,'Command',body, raw);
		//console.log('Command Headers:',headers);
		if (headers) cookieSet= headers['set-cookie'] || cookieSet;
		return body.result || false;
	} catch (e) {
		return false;
	}
}