const logger = require('../../util/Logger');
const { ROLE_PING_CONTROL_LINK } = process.env;
//const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js"); // This is to send the image via discord.
const otherLinks = require('../../handlers/messageControlLink.js'); 
const { Lovense_delete_member_session, Lovense_join_session, Lovense_check_session_start, Lovense_Start_session, Lovense_create_qr_embed } = require('../../structures/commands/toyControl.js'); 
const { leaderboardFunction } = require(`../../structures/commands/toplistFunction`);
const { select_token_panel } = require(`../../structures/commands/tokenPanel.js`);
const { select_performer_panel } = require(`../../structures/commands/performerPanel.js`);
const { ChannelType } = require('discord.js');

// Handels Slash commands
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client){

        // Check if Interaction is a Command
        if (interaction.isCommand()){
            if (!client.commands.has(interaction.commandName)) return;
            
            // Try to run the Command else replay with an Error
            try {
                await client.commands.get(interaction.commandName).execute(interaction, client);
                //statcord.postCommand(interaction.commandName, interaction.user.id);
            } catch (error) {
                console.log(error);
                logger.error(error);
                return interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        // Check if Interaction is a Select Menu
        } else if (interaction.isStringSelectMenu()) {
            logger.info(`select-menu, customId: ${interaction.customId} value: ${interaction.values}`);
        // Check if Interaction is a Button
        } else if (interaction.isButton()) {

            logger.info(`button, customId: ${interaction.customId}`);
            //const message = await interaction.fetchReply();
            
            if (interaction.customId === 'leaderboardfirst' || interaction.customId === 'leaderboardprevious' || interaction.customId === 'leaderboardnext' || interaction.customId === 'leaderboardlast'){
                leaderboardFunction(interaction);
            }

            //await interaction.deferUpdate();
            if((interaction.customId.includes("handyfeeling.com/remote?") === true) || (interaction.customId.includes("xtoys.app/session/") === true) || (interaction.customId.includes("lovense-api.com/t2/") === true) || (interaction.customId.includes("lovense.com/c/") === true)){
                //((msg.content.toString().includes('handyfeeling.com/remote?')) || (msg.content.toString().includes('xtoys.app/session/')) || (msg.content.toString().includes('.lovense-api.com/t2/')) || (msg.content.toString().includes('.lovense.com/c/')))
                //const member = interaction.message.mentions.members.first();
                //let message = interaction.update(`loading ${interaction.customId} of <@${member.id}>`);

                //let linkSessions = client.linkSessions.filter(obj => obj.includes(interaction.message.id));
                if(!client.linkSessions.find(arr => arr.includes(interaction.message.id)) ){

                    countDown(interaction.message);
                
                    const filter = m => m.customId === interaction.customId;
                    interaction.reply({ content: `<@&${ROLE_PING_CONTROL_LINK}> Raffle started...`, ephemeral: false });
                    let participants = [interaction.user.id];
                    const collector = interaction.message.createMessageComponentCollector({filter: filter, time: 30000 });

                    client.linkSessions.push(interaction.message.id);
                    //client.linkSessions.set(interaction.message.id);
                    collector.on('collect', async i => {

                        /*const wait = require('util').promisify(setTimeout);

                        await interaction.deferUpdate();
                        await wait(4000);
                        */
                        if(!participants.includes(i.user.id)){
                            participants.push(i.user.id);
                        /*
                            await client.users.fetch(i.user.id, false).then((user) => {
                                user.send(`You are added to the list and will get a DM if you are the lucky winner`);
                               });
                        */

                            //i.reply({ content: `You are added to the list and will get a DM if you are the lucky winner ${participants}`, ephemeral: true });
                            return logger.info(`button, You are added to the list and will get a DM if you are the lucky winner ${participants}`);
                       } else {
                        await client.users.fetch(i.user.id, false).then((user) => {
                            user.send(`You are already taking part in this raffle`);
                           });
                            //i.reply({ content: `...you are already taking part...${participants}`, ephemeral: true });
                            return logger.info(`button, you are already taking part ${participants}`);
                        }
                        /** 
                        if (i.user.id === interaction.user.id) {
                            i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                        } else {
                            i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                        }*/
                    });
                    
                    collector.on('end', collected => {
                    
            
                    let winner = participants[Math.floor(Math.random() * participants.length)];
        
                    //winner.send('You were randomly selected. Here is your link: ' + links)
                    var index = client.linkSessions.indexOf(interaction.message.id);
                    if (index !== -1) {
                        client.linkSessions.splice(index, 1);
                    }
                    
                    //client.linkSessions.delete(interaction.message.id);
                        console.log(`Collected ${collected.size} interactions. Winner ${winner}`);
                        //return interaction.followUp({ content: `<@${winner}> you are the winner:tada: Here is your link ${interaction.customId}`, ephemeral: true });
                    
                        client.users.fetch(winner, false).then(async (user) => {
                            const text = interaction.customId;
                            const parts = text.split("toycontrollink-");
                            const link = parts[1];
                            //create private thread instead?!
                           /* 
                            try {
                            
                                let thread = interaction.channel.threads.create({
                                    name: `${interaction.member.nickname || interaction.message.member.user.username}`,
                                    autoArchiveDuration: 10080, // For one week
                                    type: ChannelType.PrivateThread, // Set the thread type to private
                                    reason: 'Comment section',
                                  });
                                  
                                  console.log("Private thread created:", thread);
                                  if (thread) {
                                    await thread.members.add(user.id)
                                      .then(() => console.log('Member added to the thread'))
                                      .catch(console.error);
                                  } else {
                                    console.log('Thread not found');
                                  }
                                
                                let thread2 = interaction.message.startThread({
                                    name: `${interaction.member.nickname||interaction.message.member.user.username}`,
                                    autoArchiveDuration: 10080, // For one Week 24 hours 1440 default value if not set...
                                    reason: 'Comment section',
                                });
                                //await thread.setArchived(true);
                                console.log(`Created thread:`, thread2);
                                  
                            } catch(error){
                                logger.error(`(messageCreate::run) something went wrong: ${error}`);
                            }
*/
                            //send DM
                            try {
                                user.send(`<@${winner}> you are the winner :tada: Here is your link: ${link}`);
                            } catch(error){
                                logger.error(`(interactionCreate::run) Couldn't send DM: ${error}`);
                            }
                        });
                    });
                }else{
                    return console.log(`already started`);
                }
            }


            if(interaction.customId.substring(0, 12) === 'lovensejoin-' ){
                Lovense_check_session_start(interaction, interaction.customId.substring(12, interaction.customId.length))
            }

            if(interaction.customId.substring(0, 16) === 'lovensejoinorgy-' ){
                Lovense_join_session(interaction, interaction.customId.substring(16, interaction.customId.length))
            }

            if(interaction.customId.substring(0, 13) === 'lovenseleave-' ){
                Lovense_delete_member_session(interaction);
                await interaction.update({content: `Session deleted, starting new session`, ephemeral: true}).catch(err => console.error(`Error: iC lovenseleave`,err));
                Lovense_create_qr_embed(interaction);
                //Lovense_check_session_start(interaction, interaction.customId.substring(13, interaction.customId.length))
            }

            let modal;
            let ModalLink;
            let ModalText;
            let firstActionRow;
            let secondActionRow;
            
            switch(interaction.customId){
                case "button_start_control_link":
                case "button_verified":
                case "button_nonverified":
                case "button_anonymous":
                case "button_reveal":
                case "button_no_message":
                    await interaction.deferUpdate();
                    otherLinks(interaction);
                    break;
                case "button_add_edit_message":
                    otherLinks(interaction);
                    break;
                case "lovensestay":
                    await interaction.update({content: `Link to current session: `, embeds: [], components: [], ephemeral: true}).catch(err => console.error(`Error: iC lovenseleave`,err));
                    break;
                case "lovenseloginorgy":
                    await interaction.update({content: `Creating session... please wait...`, embeds: [], components: [], ephemeral: true}).catch(err => console.error(`Error: iC lovenselogin`,err));
                    Lovense_Start_session(interaction);
                    break;
                case "lovenselogingangbang":
                    await interaction.update({content: `Creating session... please wait...`, embeds: [], components: [], ephemeral: true}).catch(err => console.error(`Error: iC lovenselogin`,err));
                    Lovense_Start_session(interaction);
                    break;
                case "lovenselogintip":
                    await interaction.update({content: `Creating session... please wait...`, embeds: [], components: [], ephemeral: true}).catch(err => console.error(`Error: iC lovenselogin`,err));
                    Lovense_Start_session(interaction);
                    break;
                /*case "lovensejoin":
                    Lovense_check_session_start(interaction);
                    break;
                case "lovensejoinorgy":
                    Lovense_join_session(interaction);
                    break;*/
                case "lovenselogout":
                    //interaction.deferReply();
                    Lovense_delete_member_session(interaction);
                    break;
                case "startGangbang":
                case "startOrgy":
                case "startTipPlay":
                    Lovense_check_session_start(interaction, interaction.customId);
                    break;

                case "tokenBuyPanel":
                case "tokenBalancePanel":
                case "tokenHistoryPanel":
                case "subscriptionsActivePanel":
                case "subscriptionsHistoryPanel":
                    select_token_panel(interaction);
                    break;
                case "homePanel":
                case "tipPlayPanel":
                case "votePlayPanel":
                case "linkPlayPanel":
                case "subscriptionPanel":
                case "tipPlayPanelButtonStart":
                case "tipPlayPanelButtonTipMenuSetup":
                case "tipPlayPanelButtonToplist":
                case "tipPlayPanelButtonHistory":
                case "subscriptionPanelButtonOverview":
                case "subscriptionPanelButtonSetup":
                case "subscriptionPanelButtonToplist":
                case "subscriptionPanelButtonHistory":
                case "linkPlayPanelButtonAnonymous":
                case "linkPlayPanelButtonReveal":
                    select_performer_panel(interaction);
                    break;

                default:
                    logger.info(`button, customId: ${interaction.customId}`);
                    break;
            }
            
        } else if (interaction.isModalSubmit()) {
            if(interaction.customId === 'ModalMessage' ){
                const ModalText = interaction.fields.getTextInputValue('ModalText');
                //const otherLinks = require('../../handlers/messageControlLink.js'); 
                otherLinks(interaction, ModalText);
            }
        } else {
            return;
        }

        function countDown(message){
            console.log('Triggered')
            let embed = message.embeds[0];
            let timeLeft = 25;
            let timestamp = Math.floor(Date.now() / 1000);
            let updateInterval = setInterval(() => {
                if(timeLeft <= 0){
                    embed.description = `**Expired**: Link was sent to a member`;
                    message.edit({ content: '**Expired**: Raffle ended', embeds: [], components: [] });
                    clearInterval(updateInterval);
                }else if(timeLeft > 23){
                    embed.description = `Link will be randomly sent to the winner **<t:${timestamp+31}:R>**`;
                    message.edit({ content: `Link will be randomly sent to the winner **<t:${timestamp+31}:R>**`, embeds: [embed]});
                }
                timeLeft-=5;
            }, 5000);
        }
    },
};