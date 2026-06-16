const logger = require('../../util/Logger');

const Command = require('../../structures/Command');
const { stripIndents } = require('common-tags');
class ControlEnabledCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'controlenabled',
            group: 'management',
            memberName: 'controlenabled',
            aliases: ["control-enabled", "control-list"],
            description: 'List all channels with control links allowed.',
            details: `Only administrators may use this command.`,
            examples: ['controlenabled', 'control-enabled', 'control-list'],
            ownerOnly: true,
            guarded: true,
            guildOnly: true,
        })
    }

    hasPermission(msg) {
        if (!msg.guild) { return false }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author)
    }

    run(msg) {
        let channels = this.client.provider.get(msg.guild, "LinksAllowed", []);
        if (!channels.length) {
            return msg.reply("There's no channel allowed");
        }
        channels = channels.map(k => { return `<#${k}>`; }).join(", ");
        return msg.say(`
      \`\`\`Guild: ${msg.guild.name}
      Control links are limited to these channels:
      \`\`\`
      ${channels}
      `, {
            split: { maxLength: 1500, char: " ", prepend: "Continued..", append: ".." }
        }
        ).catch(o_o => logger.warn(`(controlenabled::run) ${o_o}`));
    }
}

module.exports = ControlEnabledCommandCommand
