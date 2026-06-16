const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Command = require('../structures/Command');

/** 

module.exports = {
	name: 'check',
	description: 'Gives an update for an anonymous lovense link status.',
	details: `The argument must be an valid anonymous lovense link.\nOnly the privileged users may use this command.`,
	group: 'lovense',
	format: '/check',
		options: [
        {
            name: 'url',
            type: ApplicationCommandOptionType.String,
            description: 'What anonymous link you want to check?',
            required: true,
        }],
	async execute(interaction) {
        await interaction.reply('Pinging...');
        const message = await interaction.fetchReply();
	},
};
*/
module.exports = {
	name: 'check',
	description: 'Gives an update for an anonymous lovense link status.',
	details: `The argument must be an valid anonymous lovense link.\nOnly the privileged users may use this command.`,
	group: 'lovense',
	format: '/check',
		options: [
        {
            name: 'url',
            type: ApplicationCommandOptionType.String,
            description: 'What anonymous link you want to check?',
            required: true,
        }],
	async execute(interaction) {
        await interaction.reply('Pinging...');
        const message = await interaction.fetchReply();
		const url = interaction.options.getString('url');
		//let message = await msg.channel.send(`Running... Keep calm and wait.`);
		//now we check the URL status
		// then reply, by editing the message.
		try {
			message.delete().catch(o_O => {});
			const lovenseData = await this.client.getLovenseLinkStatus(url);
			// console.log('Output',lovenseData);
			setTimeout(
			() => {
				message.edit(`Link status: ${lovenseData.message}`).then(e =>{
					setTimeout(() => {e.delete().catch(o_o=> {})}, 30000)
				});
			}, 5000)
		} catch (O_o) {
			message.edit('Error!\n```'+ O_o +'```');
		}
	}
}
