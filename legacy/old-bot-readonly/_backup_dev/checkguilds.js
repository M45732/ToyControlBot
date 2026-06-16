const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { stripIndents } = require('common-tags');
const Command = require('../structures/Command');

module.exports = {
	name: 'checkguilds',
	description: 'Check the current guild count and their names',
	group: 'owner',
	format: '/checkguilds',

  
/** 
  hasPermission (msg) {
    if (!msg.guild) { return this.client.isOwner(msg.author) }
    return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author)
  }
*/

  async run (msg) {
    const guildList = this.client.guilds.cache.map(m => `${m.name} (${m.id})`);

        return msg.send(stripIndents`
            \`\`\`
                The current guild count: ${this.client.guilds.cache.size}
                Guild list:
                ${guildList.join('\n')}
            \`\`\`
            `, { split: true }
        );
  }
}