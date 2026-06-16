const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const commandName = 'tip';
const { LovenseConnect_send, LovenseConnect_send_tip, LovenseConnect_getQrCode, LovenseConnect_GetConnectedToys, LovenseConnect_logout} = require('../../structures/commands/LovenseConnect');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
/*

Orgy(only by admins? always active? )

Type: Solo / (Group) / Orgy
Privacy: Public / Private
Mode: ReactionVote / Tip(only in solo)


Public:


Private:


*/

let token = option =>
    option.setName('token')
        .setDescription('How many tokens do you want to send?')
        .setRequired(true);

let message = option =>
    option.setName('message')
        .setDescription('(Optional) Add a message')
        .setRequired(true);

let messagetype = option =>
    option.setName('messagetype')
        .setDescription('Do you want to send the message public or private?')
        .setRequired(false)
        .addChoices(
            { name: 'public', value: 'public' },
            { name: 'private', value: 'private' },
        )

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('tip')
	  .setDescription('Toy Control Panel')
	  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
	  .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(token)
      .addStringOption(message)
      .addStringOption(messagetype),

	async execute(interaction) {
	


		let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_channel_id='${interaction.channel.id}' AND session_mode='tip'`;
		let query_sessions = await getDataFromDB(query);
        if (query_sessions.length == 0) {
            return interaction.reply({ content: `There is no active toy control session in this channel.`, ephemeral: true });
        }
		let session = query_sessions[0];

        if(!session.session_active) {
        //if the session is not active, send a message to the user and return
            return interaction.reply({ content: `You can only tip members in an ongoing toy control tip-session.`, ephemeral: true });
        }

        let tip = interaction.options.getString('token');
        let message = interaction.options.getString('message');
        let messagetype = interaction.options.getString('messagetype');
        //send the tip to the waitlist by updating the database

        //get the token balance of the user
		query = `SELECT balance FROM token_balance WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}'`;
		query_sessions = await getDataFromDB(query);
		let token = query_sessions[0].balance;
        let duration = 10;
        //if token balance is higher or equal to the tip amount, send the tip
        if (token >= tip) {
            //send the tip to the model
            LovenseConnect_send_tip(session.discord_user_ids, session.toy_speed, duration);
            //update the token balance in the database

            //add token history for sender
            let query = `INSERT INTO token_history (discord_guild_id, discord_user_id, discord_user_id_trigger, token_amount, event_type, event_id, timestamp) VALUES ( ${interaction.guild.id}, ${interaction.member.id}, ${session.discord_user_ids}, ${-tip}, 'tip_send', ${session.discord_message_id}, UTC_TIMESTAMP())`; //add entry to db
            await getDataFromDB(query); //await query

            for(let i = 0; i < session.discord_user_ids.length; i++) {

                //add token history for receiver
                let query2 = `INSERT INTO token_history (discord_guild_id, discord_user_id, discord_user_id_trigger, token_amount, event_type, event_id, timestamp) VALUES ( ${interaction.guild.id}, ${session.discord_user_ids} ,${interaction.member.id}, ${tip}, 'tip_received', ${session.discord_message_id}, UTC_TIMESTAMP())`; //add entry to db
                await getDataFromDB(query2); //await query

                //add tip history
                let query3 = `INSERT INTO toycontrol_tip_history (transaction_id, discord_message_id, discord_user_id_sender, discord_user_id_receiver, tip_message, split, token, queue, timestamp) VALUES ( ${interaction.guild.id}, ${interaction.member.id}, , 'tip message example','3',${tip}, '0', UTC_TIMESTAMP())`; //add entry to db
                await getDataFromDB(query3); //await query

            }

            //send a message to the user
            //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: true });

            //send a message to the model or public
            if (messagetype == 'public') {
                //send a message to the public chat
                await interaction.reply({ content: `${interaction.member.name} tipped ${tip} token.\n${message}`, ephemeral: false });
            }
            else if (messagetype == 'private') {
                //send a message to the model via whisper channel
                //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: false });
            }
            else if (messagetype == 'anonymous') {
                //send a public anonymous message 
                //await interaction.reply({ content: `You tipped ${tip} token`, ephemeral: true });
            }

        }
        else {
            await interaction.reply({ content: `You don't have enough token. Your token balance is ${token} and you tried to tip ${tip}`, ephemeral: true });
        }

	}
};