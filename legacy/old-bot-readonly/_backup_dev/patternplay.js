//should read a pattern file , based on the toys displayed. And then send it, using timeout to deliver a call to the api.
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Command = require('../structures/Command');
const Util = require('../util/Util');
const {Headers} = require('node-fetch');

module.exports = {

	name: 'selfplay',
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
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author) || this.client.isNitro(msg.member) || this.client.isPatron(msg.member)
	}
*/
	async run (msg, {url}) {
		let message = await msg.channel.send(`Loading pattern... Keep calm and wait.`);
		let cookieSet = '';
		//now we check the URL status
		// then reply, by editing the message.
		try {
			const lovenseData = await this.client.getLovenseLinkStatus(url);
			//Preparations: 
			// we NEED: 
			// SESSION
			let session = 'SESSION'
			// TOY
			let toy = 'lush';
			let toy_id ='lush-id';
			let plays = {};
			if (lovenseData.status === false) {
				console.log(lovenseData);
				cookieSet = lovenseData.cookie || '';
				await message.edit(lovenseData.message||'Invalid Link provided.').then(e =>{
					setTimeout(() => {
						e.delete().catch(o_o=> {});
						msg.delete().catch(o_O => {});
					}, 30000);
				}).catch(o => {});
				return;
			} else {
				await message.edit(`${lovenseData.message}`);
				plays = lovenseData.plays.pop();
				console.log(plays);
				toy = plays.toy;
				toy_id = plays.toy_id;
				session = plays.session;
			}

			// msg.delete().catch(o_O => {});
			// now we start.
			let i=0;

			// PATTERN
			const pattern = await Util.readPatternForToy(toy);
			if (!pattern.pattern.length) {
				await message.edit(`${pattern.name}`).catch(o_o=> {});
				return;
			}

			let x = await lovenseStartAnonymousPush(session, cookieSet);
			console.log('Init start',x);

			let intr = setInterval(async function(){
				if (i>20) {
					await message.edit(`Pattern ${pattern.name.split('.')[0]} truncated.`).catch(o_o=> {});
					await lovenseSendAnonymousPush(session, toy_id, '0', cookieSet);
					clearInterval(intr);
					return;
				}

				if (! pattern.pattern.length) {
					await lovenseSendAnonymousPush(session, toy_id, '0', cookieSet);
					await message.edit(`Pattern ${pattern.name.split('.')[0]} completed.`).catch(o_o=> {});
					clearInterval(intr);
					return;
				}

				++i;
				let cplay = pattern.pattern.pop();
				console.log('Play', i, pattern.pattern.length, cplay,toy, toy_id);
				let ret = await lovenseSendAnonymousPush(session, toy_id, cplay, cookieSet);
				console.log('Send Command: ', ret);
				let conn = await lovenseCheckConnection(session,cookieSet);
				console.log(conn);
				await message.edit(`Playing [${i}] pattern: ${pattern.name.split('.')[0]} on speed: ${cplay} \n${ret}`);
				if (!conn) {
					await lovenseSendAnonymousPush(session, toy_id, '0', cookieSet);
					await message.edit(`Pattern ${pattern.name.split('.')[0]} completed by the other side.`).catch(o_o=> {});
					clearInterval(intr);
					return;
				}
			},2000);
		} catch (O_o) {
			message.edit('Error!\n```'+ O_o +'```');
		}
	}
}


async function lovenseCheckConnection(session, cookieSet='') {
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

	const request = require('node-superfetch');
	let timestamp = Math.floor(Date.now() / 1000);
	let baseURL = `https://api2.lovense.com/app/ws/loading/${session}?_=${timestamp}`
	try {
		const {body,text, headers} = await request.get(baseURL, requestOptions);
		console.log('Check', text);
		return body || false;
	} catch (e) {
		return false;
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
	let val = values.split(',');
	let vibration=Math.floor(val[0])||0;
	let pulse=Math.floor(val[1])||0;
	let rotate = Math.floor(val[2])||0;
	vibration = Math.min(vibration,1);
	let raw = `order={'cate':'id','id':{'${toy_id}':{'v':${vibration},'p':${pulse},'r':${rotate}}}}`;
	requestOptions.body=raw;

	try {
		const {body, text, headers} = await request.post(baseURL, requestOptions);
		console.log(baseURL,cookieSet,'Command',body, raw);
		console.log('Command Headers:',headers);
		if (headers) cookieSet= headers['set-cookie'] || cookieSet;
		return body.result || false;
	} catch (e) {
		return false;
	}
}