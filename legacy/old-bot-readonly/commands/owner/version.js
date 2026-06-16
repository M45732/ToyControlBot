const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
//const Command = require('../../structures/Command');
const logger = require('../../util/Logger');
const packages = require('../../package.json');

module.exports = {
	data: new SlashCommandBuilder()
	  .setName("version")
	  .setDescription("Show information about the bots version")
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		try {
			interaction.reply(`I'm currently running under version: ${packages.version}\nNode Version: ${process.versions.node}`);
		} catch (err) {
			logger.error(`(version::run) an error occured: ${err}`);
		}
/*
stats.js
918 bytes
const { version } = require("discord.js");
const errors = require("../utils/errors.js");
const moment = require("moment");
require("moment-duration-format");
module.exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
  const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  message.channel.send(`= STATISTICS =
• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime     :: ${duration}
• Users      :: ${client.users.size.toLocaleString()}
• Servers    :: ${client.guilds.size.toLocaleString()}
• Channels   :: ${client.channels.size.toLocaleString()}
• Discord.js :: v${version}
• Node       :: ${process.version}`, {code: "asciidoc"});
};
module.exports.help = {
  name: "stats",
  category: "Miscelaneous",
  description: "Gives some useful bot statistics",
  usage: "stats"
};
*/



/*changelog
const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { shorten, base64 } = require('../../util/Util');
const { GITHUB_USERNAME, GITHUB_PASSWORD, XIAO_GITHUB_REPO_USERNAME, XIAO_GITHUB_REPO_NAME } = process.env;

module.exports = class ChangelogCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'changelog',
			aliases: ['updates', 'commits'],
			group: 'util',
			memberName: 'changelog',
			description: 'Responds with the bot\'s latest 10 commits.',
			guarded: true
		});
	}

	async run(msg) {
		const { body } = await request
			.get(`https://api.github.com/repos/${XIAO_GITHUB_REPO_USERNAME}/${XIAO_GITHUB_REPO_NAME}/commits`)
			.set({ Authorization: `Basic ${base64(`${GITHUB_USERNAME}:${GITHUB_PASSWORD}`)}` });
		const commits = body.slice(0, 10);
		const embed = new MessageEmbed()
			.setTitle(`[${XIAO_GITHUB_REPO_NAME}:master] Latest 10 commits`)
			.setColor(0x7289DA)
			.setURL(`https://github.com/${XIAO_GITHUB_REPO_USERNAME}/${XIAO_GITHUB_REPO_NAME}/commits/master`)
			.setDescription(commits.map(commit => {
				const hash = `[\`${commit.sha.slice(0, 7)}\`](${commit.html_url})`;
				return `${hash} ${shorten(commit.commit.message.split('\n')[0], 50)} - ${commit.author.login}`;
			}).join('\n'));
		return msg.embed(embed);
	}
};

*/


/*
donate.js
498 bytes
const Command = require('../../structures/Command');
const { stripIndents } = require('common-tags');
module.exports = class DonateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'donate',
			aliases: ['patreon', 'paypal'],
			group: 'util',
			memberName: 'donate',
			description: 'Responds with the bot\'s donation links.',
			guarded: true
		});
	}
	run(msg) {
		return msg.say(stripIndents`
			Contribute to development!
			<https://paypal.me/>
		`);
	}
};

*/



/*

const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { version, dependencies } = require('../../package');
const { RAIN_GITHUB_REPO_USERNAME, RAIN_GITHUB_REPO_NAME } = process.env;
const source = RAIN_GITHUB_REPO_NAME && RAIN_GITHUB_REPO_USERNAME;

module.exports = class InfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			aliases: ['information', 'stats'],
			group: 'util',
			memberName: 'info',
			description: 'Responds with detailed bot information.',
			guarded: true,
			clientPermissions: ['EMBED_LINKS']
		});
	}

	run(msg) {
		const embed = new MessageEmbed()
			.setColor(0x00AE86)
			.setFooter('©2017-2018 @Myth#5546')
			.addField('❯ Servers', this.client.guilds.size, true)
			.addField('❯ Shards', this.client.options.shardCount, true)
			.addField('❯ Commands', this.client.registry.commands.size, true)
			.addField('❯ Home Server', this.client.options.invite ? `[Here](${this.client.options.invite})` : 'None', true)
			.addField('❯ Source Code',
				source ? `[Here](https://github.com/${RAIN_GITHUB_REPO_USERNAME}/${RAIN_GITHUB_REPO_NAME})` : 'N/A', true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('hh:mm:ss', { trim: false }), true)
			.addField('❯ Version', `v${version}`, true)
			.addField('❯ Node Version', process.version, true);
			//.addField('❯ Dependencies', this.parseDependencies());
		return msg.embed(embed);
	}

	parseDependencies() {
		return Object.entries(dependencies).map(dep => {
			if (dep[1].startsWith('github:')) {
				const repo = dep[1].replace('github:', '').split('/');
				return `[${dep[0]}](https://github.com/${repo[0]}/${repo[1].replace(/#.+/, '')})`;
			}
			return `[${dep[0]}](https://npmjs.com/${dep[0]})`;
		}).join(', ');
	}
};


*/



/*
		let memory = process.memoryUsage();
		let memoryArray = [];
		let heapStats = v8.getHeapStatistics()
		let heapArray = [];

		for (let key in memory) {
			memoryArray.push(`${Math.round(memory[key] / 1024 / 1024 * 100) / 100} MB`);
		}

		for (let key in heapStats) {
			heapArray.push(`${Math.round(heapStats[key] / 1024 / 1024 )}`);
		}

		if (!msg.guild.members.cache.has(msg.guild.ownerID)) await msg.guild.members.cache.fetch(msg.guild.ownerID);
		const embed = new MessageEmbed()
			.setColor(0x00AE86)
			.setThumbnail(msg.guild.iconURL({ format: 'png' }))
			.addField('❯ Name', msg.guild.name, true)
			.addField('❯ Region', msg.guild.region.toUpperCase(), true)
			.addField('❯ Created (UTC)', moment.utc(msg.guild.createdAt).format('YYYY-MM-DD HH:mm'), true)
			.addField('❯ Explicit Filter', msg.guild.explicitContentFilter, true)
			.addField('❯ Verification Level', msg.guild.verificationLevel, true)
			.addField('❯ Owner', msg.guild.owner.user.tag, true)
			.addField('❯ Members', msg.guild.memberCount, true)
			.addField('❯ Roles', msg.guild.roles.cache.size, true)
			.addField('❯ Channels', msg.guild.channels.cache.size, true)
			.addField('❯ ID', msg.guild.id, true)
			.addField('❯ RSS', memoryArray[0], true)
			.addField('❯ Heap Used', memoryArray[1], true)
			.addField('❯ Heap Total', memoryArray[2], true)
			.addField('❯ Total Heap Size', heapArray[0], true)
			.addField('❯ Total Heap Size Exextutable', heapArray[1], true)
			.addField('❯ Total Physical Size', heapArray[2], true)
			.addField('❯ Total Available Size', heapArray[3], true)
			.addField('❯ Used Heap Size', heapArray[4], true)
			.addField('❯ Heap Size Limit', heapArray[5], true)
			.addField('❯ Malloced Memory', heapArray[6], true)
			.addField('❯ Peak Malloced Meomry', heapArray[7], true)
			.addField('❯ Does Zap Garbage', heapArray[8], true)
			.addField('❯ Number Of Native Contexts', heapArray[9], true)
			.addField('❯ Number of Detached Contexts', heapArray[10], true);
		return msg.embed(embed);

		*/
	}
	
};