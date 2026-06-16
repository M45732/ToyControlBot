const Command = require('../../structures/Command');
const logger = require('../../util/Logger');

class ControlDisableCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'controldisable',
            group: 'management',
            memberName: 'controldisable',
            aliases: ["controloff", "control-off", "control-disable"],
            description: 'Disallows control links in the channel.',
            details: `Only administrators may use this command.`,
            examples: ['controldisable', "control-off"],
            ownerOnly: true,
            guarded: true,
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    label: 'what channel?',
                    prompt: 'Which channel would you like to enable?',
                    type: 'channel',
                    default: msg => msg.channel
                }
            ]
        })
    }

    hasPermission(msg) {
        if (!msg.guild) { return false }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author) ||
            msg.member.permissionsIn(msg.channel.id).has('MANAGE_CHANNELS'); // for personal channels
    }

    run(msg, { channel }) {
        /* Check if member also has permissions in the target channel
         *            \|||/
         *            (o o)
         *   ,----ooO--(_)-------.
         *   | Please            |
         *   |   don't feed the  |
         *   |     TROLL's !     |
         *   '--------------Ooo--'
         *           |__|__|
         *            || ||
         *           ooO Ooo
         */
        if (!msg.member.permissionsIn(channel.id).has('MANAGE_CHANNELS')) {
            return msg.reply(`You do not have permission to use the ${this.name} command on <#${channel.id}>.`);
        }

        msg.delete().catch(O_o => { });
        if (!channel) return;
        let channels = this.client.provider.get(msg.guild, "LinksAllowed", []);
        logger.debug(`(xpenable::run) channels='${channels}'`);
        channels = channels.filter(item => item !== null);
        const updated = channels.filter(item => item !== `${channel.id}`);
        logger.debug(`(xpenable::run) updated='${updated}'`);

        if (channels.length == updated.length) {
            return msg.say(`Control links are already disabled in this channel.`).then(e => {
                setTimeout(() => { if (e) e.delete().catch(o_o => { }) }, 10000)
            });
        }
        this.client.provider.set(msg.guild, "LinksAllowed", updated);
        return msg.say(`Control links are not allowed on <#${channel.id}> channel any more.`).then(e => {
            setTimeout(() => { e.delete().catch(o_o => { }) }, 30000)
        })
    }
}

module.exports = ControlDisableCommandCommand
