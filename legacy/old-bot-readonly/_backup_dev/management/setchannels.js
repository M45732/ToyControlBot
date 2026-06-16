const { Command } = require('discord.js-commando')
const { options } = require('../../config/logOptions')
const log = require('node-file-logger')
log.SetUserOptions(options)

module.exports = class TemperatureCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'setchannel',
			group: `management`,
			memberName: `setchannel`,
			description: `Sets channel for control links`,
			guildOnly: false,
			ownerOnly: false,
			examples: [`setchannel #controlChannelID`],
		})
	}

	async run (msg) {
        let channel = msg.mentions.channels.first();
        
        if(!channel)
            return msg.channel.send('I need you to mention a channel for control links')


        this.client.provider.set(msg.guild, 'linkChannel', channel.id)
        msg.channel.send('Channel set')
	}
}
