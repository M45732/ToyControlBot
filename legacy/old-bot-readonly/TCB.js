require('dotenv').config();
const { TOKEN } = process.env;
const { Client, Collection, IntentsBitField, Partials } = require('discord.js');
const fs = require('fs');
const logger = require('./util/Logger');
// const Statcord = require("statcord.js");
const myIntents = new IntentsBitField();
myIntents.add(
	IntentsBitField.Flags.DirectMessageReactions, 
	IntentsBitField.Flags.DirectMessageTyping,
	IntentsBitField.Flags.DirectMessages,
	IntentsBitField.Flags.GuildEmojisAndStickers,
	IntentsBitField.Flags.GuildIntegrations,
	IntentsBitField.Flags.GuildInvites,
	IntentsBitField.Flags.GuildMembers,
	IntentsBitField.Flags.GuildMessageReactions,
	IntentsBitField.Flags.GuildMessageTyping,
	IntentsBitField.Flags.GuildMessages,
	IntentsBitField.Flags.GuildModeration,
	IntentsBitField.Flags.GuildPresences,
	IntentsBitField.Flags.GuildScheduledEvents,
	IntentsBitField.Flags.GuildVoiceStates,
	IntentsBitField.Flags.GuildWebhooks,
	IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.MessageContent
	);
const client = new Client({ intents: myIntents, partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember] });

client.qonSessions = new Collection()
client.linkSessions = []

const Events = require("./handlers/Events");
const bufferEvents = Events.events(client);

client.commands =new Collection()
const Commands = require("./handlers/Commands")
const bufferCommands = Commands.commands(client);
//if (!buffer) return;
const yaml = require('js-yaml')
const lovenseOptions = yaml.load(fs.readFileSync('./config/lovenseOptions.yml', 'utf8'))

client.lovense = {
	panel: false, 
	colector:false,
	active:false,
	options: lovenseOptions
};


client.on('disconect', event => {
	logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
	process.nextTick(function() {setTimeout(process.exit, 5000);});
});

client.on('error', err => logger.error(`[ERROR]:  ${err}`));
client.on('info', err => logger.info(`[INFO]: ${err}`));
client.on('warn', err => logger.warn(`[WARNING]: ${err}`));

client.on('commandError', (command, err) => logger.error(`[COMMAND ERROR]:  ${command.name} -> ${err}`));

process.on('exit', (code) => {
	logger.warn(`About to exit with code: ${code}`);
	for(let session of client.qonSessions){
		const channelId = session[1].channelid;
		const messageId = session[0];
		
		/*client.channels.fetch(channelId).then(channel => {
			channel.messages.delete(messageId);
		});*/

		/*
		const channel = client.channels.cache.get(channelId);
		const message = channel.messages.fetch(messageId);
		if (message.type!=20) {
			channel.messages.delete(messageId)
			//message.delete()
		}
		*/

	}


	process.nextTick(function() {setTimeout(process.exit, 5000);});
});

process.on('SIGINT', () => {
	logger.warn('Received SIGINT. App stops now.')
	process.nextTick(function() {setTimeout(process.exit, 1000);});
});
process.on('SIGTERM', () => {
	logger.warn('Received SIGTERM.');
	process.nextTick(function() {setTimeout(process.exit, 5000);});
});
process.on('unhandledRejection', (reason,promise) => {
	logger.error(`[FATAL] Unhandled Promise Rejection :${reason.stack||reason}`);
	logger.error(`[FATAL] Process: ${reason}`);
	//process.nextTick(function() {setTimeout(process.exit, 5000);});
});

client.login(`${TOKEN}`);