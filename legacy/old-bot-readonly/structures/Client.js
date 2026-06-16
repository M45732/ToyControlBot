/* Files 
require('dotenv').config();
const { CHAN_ID_AFK, CHAN_ID_GENERAL, GUILD_ID, USE_PARTIALS, WEBHOOK_ID, WEBHOOK_TOKEN } = process.env;
const { SQL_USE_MYSQL, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const clientOptions = yaml.load(fs.readFileSync('./config/clientOptions.yml', 'utf8'))
*/
/********* LOVENSE SETTINGS **********
const lovenseOptions = yaml.load(fs.readFileSync('./config/lovenseOptions.yml', 'utf8'))

const { CommandoClient, SQLiteProvider } = require('discord.js-commando');

const { WebhookClient } = require('discord.js');

const schedule = require('node-schedule');

const moment = require('moment')
const chalk = require('chalk')

const cases = {
	'alert': { content: chalk.red('Alert'), type: 'warn' },
	'critical': { content: chalk.red('Critical'), type: 'warn' },
	'debug': { content: chalk.magenta('Debug'), type: 'log' },
	'emergency': { content: chalk.red('Emergency'), type: 'warn' },
	'error': { content: chalk.red('Error'), type: 'error' },
	'info': { content: chalk.cyan('Info'), type: 'log' },
	'notice': { content: chalk.yellow('Notice'), type: 'warn' },
	'success': { content: chalk.green('Success'), type: 'log' },
	'verbose': { content: chalk.magenta('Verbose'), type: 'log' },
	'warn': { content: chalk.yellow('Warn'), type: 'warn' }
}


///////////////// LOGGER SETUP //////////////
const Logger = require('../util/Logger');

//////////////// LOGGER DONE ////////////////

module.exports = class VMTClient extends CommandoClient {
	constructor(options) {
		super(options);

		this.webhook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN,
			{ disableEveryone: true });
		this.points = {};
		this.apiRequestMethod = clientOptions.apiRequestMethod,
		this.messageCacheMaxSize = clientOptions.messageCacheMaxSize,
		this.messageCacheLifetime = clientOptions.messageCacheLifetime,
		this.messageSweepInterval = clientOptions.messageSweepInterval,
		this.fetchAllMembers = clientOptions.fetchAllMembers,
		this.disableEveryone = options.disableEveryone,
		this.disabledEvents = options.disabledEvents,
		this.partials = options.partials,
		this.autoReconnect = options.autoReconnect,
		this.restTimeOffset = clientOptions.restTimeOffset,
		this.restRequestTimeout = clientOptions.restRequestTimeout,
		this.restSweepInterval = clientOptions.restSweepInterval,
		this.retryLimit = clientOptions.retryLimit,
		// Commando Options
		this.commandPrefix = options.commandPrefix,
		this.commandEditableDuration= options.commandEditableDuration,
		this.nonCommandEditable = options.nonCommandEditable,
		this.unknownCommandResponse = options.unknownCommandResponse,
		this.invite = options.invite,
		this.owner = [options.owner],
		this.loggerHook = Logger;
		this.lovense = {
			panel: false, 
			colector:false,
			active:false,
			options: lovenseOptions
		};
		this.vibeMyToyGuild = GUILD_ID;
		this.patronRole ='atron';
		this.nitroRole= 'Nitro';
*/
		/* **************************************************************************************************** *\
		Load SQL Provider
		\* **************************************************************************************************** 
		if (SQL_USE_MYSQL==='false') {
			const sqlite = require('sqlite');
			sqlite.open(path.join(__dirname, '../data/database.sqlite'))
			.then(db => {
				this.setProvider(new SQLiteProvider(db))
			})
			.then(o_o=>{Logger.debug(`(client::constructor) SQLiteProvider set`)})
			.catch(o_o=>{Logger.error(`(client::constructor) Error on setting SQLiteProvider '${o_o}'`)});
		} else {
			const MySQL = require('mysql2/promise')
			const MySQLProvider = require('discord.js-commando-mysqlprovider')
			MySQL.createConnection({
				host: MYSQL_HOST,
				port: MYSQL_PORT,
				user: MYSQL_USER,
				password: MYSQL_PASSWORD,
				database: MYSQL_DATABASE,
				connectTimeout: 20 * 1000
			})
			.then(db => {
				['wait_timeout', 'interactive_timeout'].forEach(timeout => {
					db.execute(`SET SESSION ${timeout}=86400`)
				})
				this.setProvider(new MySQLProvider(db))
			})
			.then(o_o=>{Logger.debug(`(client::constructor) MySQLProvider set`)})
			.catch(o_o=>{Logger.error(`(client::constructor) Error on setting MySQLProvider '${o_o}'`)});
		}
	}

	isPatron(member) {
		// We shall check roles for user on VMT server, and reply with true or false if there's a match with this.patrons
		//user have any of the roles with patron in it.
		return member.roles.cache.some(r=>r.name.includes(this.patronRole));
	}

	isNitro(member) {
		return member.roles.cache.some(r=>r.name.includes(this.nitroRole));
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async lovenseSendAnonymousPush(session, values) {
		const requestOptions = {
			redirect:'manual',
			follow: 0,
			compress: false
		};
*/
		/**
		post : order: {'cate':'id','id':{'TOY_ID':{'v':1,'p':0,'r':0}}}
		*
		const request = require('node-superfetch');
		let timestamp = Math.floor(Date.now() / 1000);
		let baseURL = `https://apps.lovense.com/app/ws/command/${session.session[1]}?_=${timestamp}`
		try {
			const {body} = await request.get(baseURL, requestOptions);
			return body.result || false;
		} catch (e) {
			return false;
		}
	}

	async lovenseCheckConnection(session) {
		const requestOptions = {
			redirect:'manual',
			follow: 0,
			compress: false
		};
		const request = require('node-superfetch');
		let timestamp = Math.floor(Date.now() / 1000);
		let baseURL = `https://api.lovense.com/developer/v2/loading/${session.session[1]}`
		try {
			const {body} = await request.get(baseURL, requestOptions);
			return body.result || false;
		} catch (e) {
			return false;
		}
	}

	async getLovenseLinkStatus(url) {
		let result = {
			status: false,
			message: 'Generic error message.'
		};
		const requestOptions = {
			redirect:'manual',
			follow: 0,
			compress: false
		};

		const request = require('node-superfetch');

		// we strip url first
		let timestamp = Math.floor(Date.now() / 1000);
		const links = url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g);
		if (!links) {
			result.links = links;
			result.status = false;
			result.message = `No valid link provided.`;
			return result;
		} else {
			result.links = links;
			result.status=true;
			result.message = `Processing.`;

		}
		let res={};
		let session= [];
		let baseURL='-';
		result.plays=[];
		let cookie = '';
		try {
			const res = await request.get(links,requestOptions);
			session = res.url.match(/play\/([^']*)/);
			result.session = session;
			result.headers = res.headers;
			result.cookie = res.headers['set-cookie']|| '';
		} catch (err) {
			console.error('Error',err);
			res= {url: links};
			result.error = err;
			result.status=false;
			result.message = `Error processing link.`
		}
		/// SESSION Validation
		if (session == null) {
			result.status=false;
			result.message=`Fake link.`;
		} else {
			if (session.length) {
				baseURL = `https://api.lovense.com/developer/v2/loading/${session[1]}`
				const {body} = await request.get(baseURL, requestOptions);
				result.data= body;
				if (! result.data.result ) {
					result.status = false;
					result.message = result.data.message;
				} else {
					// we have valid data, so let's roll.
					let returnMessage = body;
					result.toys = [];
					let toyIDs = returnMessage.data.toyId.split(',');
					let toyNames = returnMessage.data.toyType.split(',');
					let toysON = toyIDs.length;
					if (toysON>0) {
						let toyData = {};
						for (let i = 0; i < toyIDs.length; ++i) {
							let tDetails = {};
							let timeLeft= moment.duration(returnMessage.data.leftTime,'seconds').humanize();
							if (returnMessage.data.leftTime == 0 ) {
								timeLeft = 'Till dead';
							}
							tDetails.toy=toyNames[i];
							tDetails.toy_id=toyIDs[i];
							tDetails.session = session[1] || '-1';
							tDetails.battery = toyData.battery ||'-1';
							tDetails.timeLeft = timeLeft;
*/
							/**
							embed
							.addField('Toy',`${toyData.name} - ${toyData.id}`,true)
							.addField('Battery', toyData.battery,true)
							.addField('TimeLeft',timeLeft,true);
							**/
/*
							result.toys.push(tDetails.toy);
							result.plays.push(tDetails);
							result.timeLeft = timeLeft;
						}
					}

					if (result.toys.length>0) {
						result.message =`Toy(s) in: ${result.toys.join(',')} for ${result.timeLeft}`;
					}
				}
			} else {
				result.status=false;
				result.message='No match.';
			}
		}
		return result;
	}

	joinAFKChannel() {
		const channel = this.channels.cache.get(CHAN_ID_AFK); //Team VC
		if (!channel) return console.error(`The channel does not exist!`);
		channel.join().then(connection => {
			// Yay, it worked!
			Logger.debug(`(client::constructor) Successfully connected.`);
		}).catch(e => {
			// Oh no, it errored! Let's log it to console :)
			Logger.error(`(client::constructor) Error on AFK channel${e}`);
		});
	}

	getClientColor (client, message) {
		if (typeof message === 'object' && message.guild) {
			if (message.guild.me.displayHexColor === '#000000') {
				return 0x7289DA
			} else {
				return Number(message.guild.me.displayHexColor.replace('#', '0x'))
			}
		} else {
			return 0x7289DA
		}
	}

	getFileName (client, dir) {
		return dir.split(/(\\|\/)/g).pop().split('.')[0]
	}

	logger (client, type, body, parent, child) {
		if (!Object.keys(cases).includes(type.toLowerCase())) throw new TypeError(`Must be a valid log case.`)
		if (parent == null || parent === '') { parent = client.getFileName(process.cwd()) }

		try {
			require(child)
			delete require.cache[require.resolve(child)]
			child = client.getFileName(child)
		} catch (e) {
			if (child == null || child === '') {
				child = '<anonymous>'
			}
		}

		body = body == null ? '' : body.toString()
		let formatBody = ''; let prefix = ''
		if (body.length > 0) {
			prefix = '┌─'
			body = body.split('\n')
			for (let i = 0; i < body.length; ++i) {
				i + 1 !== body.length ? formatBody += `│ ${body[i]}\n` : formatBody += `└ ${body[i]}`
			}
		} else {
			prefix = '──'
		}

		let date = chalk.gray(moment().format(`YYYY-MM-DD|HH:mm:ss:SSSS`))
		let title = `${chalk.cyan(parent)}${chalk.gray('→')}${(chalk.cyan(child))}`
		console[cases[type].type](`${prefix}[${date}]─[${title}]─[${cases[type].content}]\n${formatBody}`)
	}
}
*/