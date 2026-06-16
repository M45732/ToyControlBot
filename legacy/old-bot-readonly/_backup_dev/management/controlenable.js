const Command = require('../../structures/Command');
const logger = require('../../util/Logger');

class ControlEnableCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'controlenable',
            group: 'management',
            memberName: 'controlenable',
            aliases: ["controlon", "control-on", "control-enable"],
            description: 'Allows control links in the channel.',
            details: `Only administrators may use this command.`,
            examples: ['controlenable', "control-on"],
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

        msg.delete().catch(O_o => { console.log(O_o) });
        if (!channel) return;
        let channels = this.client.provider.get(msg.guild, "LinksAllowed", []);
        logger.debug(`(controlenable::run) channels='${channels}'`);
        const updated = channels.filter(item => item == `${channel.id}`);
        logger.debug(`(controlenable::run) updated='${updated}'`);

        if (updated.length > 0) {
            return msg.say(`Control links are already allowed in this channel.`).then(e => {
                setTimeout(() => { if (e) e.delete().catch(o_o => { console.log(o_o) }) }, 10000)
            });
        }

        // Strip duplicates
        if (channel !== null) channels.push(channel.id);
        channels = channels.filter(item => item != null);

        this.client.provider.set(msg.guild, "LinksAllowed", channels);
        return msg.say(`Control links are now allowed on <#${channel.id}> channel.`).then(e => {
            setTimeout(() => { if (e) e.delete().catch(o_o => { console.log(o_o) }) }, 30000)
        });
    }
}

module.exports = ControlEnableCommandCommand
