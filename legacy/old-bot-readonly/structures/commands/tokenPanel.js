const { ButtonStyle } = require('discord.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
const moment = require("moment");
const select_token_panel = async (interaction ) => {

    let toycontrolpanel;
    let mainPanelButtons;
    let subPanelButtons;
    let buyTokenPanelButtonStatus = ButtonStyle.Primary;
    let tokenBalancePanelButtonStatus = ButtonStyle.Primary;
    let tokenHistoryPanelButtonStatus = ButtonStyle.Primary;
    let activeSubscriptionsPanelButtonStatus = ButtonStyle.Primary;
    let subscriptionHistoryPanleButtonStatus = ButtonStyle.Primary;


    //get the curren token balance from the database
    let query
    let query_sessions
    let token
    let entry


    switch(interaction.customId){
        case "tokenBuyPanel":

            interaction.reply({content: 'You can get daily free tokens by using the ``/daily-free-token`` command in <#795952030228414474>\nTo get additional tokens you can:\n1) Boost the server\n2) Become a patron to get extra token: [https:/patreon.com/vibemytoy](https:/patreon.com/vibemytoy)', ephemeral: true}).then();

        break;

        case "tokenBalancePanel":
  
            //get the curren token balance from the database
            query = `SELECT balance FROM token_balance WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}'`;
            query_sessions = await getDataFromDB(query);
            token = query_sessions[0].balance;

            await interaction.reply({ content: `Your token balance is: ${token} token`, ephemeral: true });
        break;

        case "tokenHistoryPanel": 
 
            //get the curren token history from the database
            query = `SELECT discord_user_id_trigger, token_amount, event_type, event_id, timestamp FROM token_history WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}' ORDER BY timestamp DESC`;
            query_sessions = await getDataFromDB(query);
            //token = query_sessions[0].balance;
            entry = "";
			for(let i in query_sessions){
                //adding who tipped the user or by who the tip came and the event?
                if(query_sessions[i].discord_user_id_trigger !== ""){
                    entry = entry + `${moment.utc(query_sessions[i].timestamp).format('YYYY-MM-DD HH:mm')} UTC | ${query_sessions[i].token_amount} tokens for ${query_sessions[i].event_type}\n`;
                }else{
                    entry = entry + `${moment.utc(query_sessions[i].timestamp).format('YYYY-MM-DD HH:mm')} UTC | ${query_sessions[i].token_amount} tokens for ${query_sessions[i].event_type}\n`;
                }

            }

            await interaction.reply({ content: `Your token history:\n${entry}`, ephemeral: true });
            
        break;

        case "subscriptionsActivePanel": 
 
            //get the curren token history from the database
            query = `SELECT discord_user_id_trigger, token_amount, event_type, event_id, timestamp FROM token_history WHERE discord_user_id='${interaction.member.id}' AND discord_guild_id='${interaction.guild.id}' ORDER BY timestamp DESC`;
            query_sessions = await getDataFromDB(query);
            //token = query_sessions[0].balance;

            interaction.reply({content: `You active subscriptions: -placeholder-`, ephemeral: true}).then();

        break;

        case "subscriptionsHistoryPanel": 
 
            interaction.reply({content: `Your subscriptions history: -placeholder-`, ephemeral: true}).then();

        break;

        default:
            interaction.reply({content: `Error: Button Command not found!`, ephemeral: true}).then();
        }


	};
module.exports.select_token_panel = select_token_panel