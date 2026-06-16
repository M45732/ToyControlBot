/** 
const { Command } = require('discord.js-commando');

module.exports = class VmtCommand extends Command {
	constructor(client, info) {
		super(client, info);

		this.argsSingleQuotes = info.argsSingleQuotes || false;
		this.throttling = info.throttling || { usages: 1, duration: 5 };
	}
	async react(msg, { str = '', success = true }) {
		if (msg.guild && !msg.channel.permissionsFor(this.client.user).has('ADD_REACTIONS')) {
			if (!str) return null;
			return msg.reply(str);
		}
		await msg.react(success ? '☑' : '🇽');

		return null;
	}
};
*/