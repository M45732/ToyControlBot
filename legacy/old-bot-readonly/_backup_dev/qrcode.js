//creates the QR code, probably not needed (maybe only keep it for development)
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

const Command = require('../structures/Command');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs')
const yaml = require('js-yaml')
const commandName = 'qlog';

const request = require('node-superfetch');


module.exports = {

	name: commandName,
	group: 'lovense',
	description: `Logins & plays in the lovense connect`,
	format: '/qlog',
	options: [
	{
		name: 'user',
		type: ApplicationCommandOptionType.User,
		description: 'What user do you want to share with?',
		required: true,
	}],

	async run(msg, { user }) {
		const lovenseConfig = yaml.load(fs.readFileSync(`./config/lovenseOptions.yml`, 'utf8'));
		console.log(lovenseConfig);

		if (!user) {
			user = msg.author;
		}
		let imageRequest = `https://api.lovense.com/api/lan/getQrCode?token=${lovenseConfig.token}&uid=${msg.author.id}&uname=${msg.author.username}&utoken=${lovenseConfig.uid}`;

		const { body } = await request.post(`${imageRequest}`).catch(O_o=> {
			msg.author.reply(`Critical failure. contact bot owner.`); 
		});

		if (!body) {
			return false;
		}
		if (body.code > 0  ) {// we have error
			msg.author.send(`Failure: [${body.message}]`);
			console.error(`Failure calling for ${msg.author}:`,body);
			return;
		}
		let img = body.message;

		if (!body.result) {
			// failure
			msg.author.send(`Failure: ${body.message}`);
		} else {
			let qrcodeMessage = new EmbedBuilder()
			.setDescription('Download the lovense connect app and scan this QR with it:')
			.addFields({name: 'Android:', value: '<https://play.google.com/store/apps/details?id=com.lovense.connect>'})
			.addFields({name: 'iOS', value: '<https://itunes.apple.com/us/app/lovense-connect/id1273067916>'})
			//.addField('REQ',imageRequest)
			.setThumbnail(img)
			.setImage(img);
			msg.author.send(qrcodeMessage)
			.catch(err => {
				console.error(`SEND EMBED to ${msg.author}:`,err);
			});
		}
	}
};
