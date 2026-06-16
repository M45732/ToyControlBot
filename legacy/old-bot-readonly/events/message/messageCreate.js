require('dotenv').config();
const logger = require('../../util/Logger');
const { GUILD_ID, OWNERS, PREFIX, CHAN_ID_VMT_BOT, CHAN_ID_TOY_CONTROL, CHAN_ID_30PLUS_CONTROL, CHAN_ID_ON_DISPLAY_CHAT, CHAN_ID_PLAYROOM, TOKEN, CLIENT_ID } = process.env;
const { ChannelType, REST, Routes } = require('discord.js');
const rest = new REST().setToken(TOKEN);
module.exports = {
    name: 'messageCreate',
    async execute(message, client){
        const ownersArray = OWNERS.split(",")
        // The old way just if something went wrong... just owners can use it
        if(ownersArray.includes(`${message.author.id}`)) { 
            try {
                const commandsData = client.commands.map(({execute, ...data }) => data);
                await client.application?.fetch();

                // Add Commands as Slash Commands
                if (message.content.toLowerCase() === `${PREFIX}deploy-guild-commands`){
                    await client.guilds.cache.get(GUILD_ID)?.commands.set(commandsData);
                    message.reply(`Deployed Guild Commands`);
                }
                // Update Slash Commands
                if(message.content.toLowerCase() === `${PREFIX}deploy-global-commands`){
                    await client.application?.commands.set(commandsData);
                    message.reply(`Deployed Global Commands`);
                }
                // Remove all Slash Commands
                if(message.content.toLowerCase() === `${PREFIX}remove-all-commands`){

                    try {
                        console.log('Removing all commands...');
                        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
                        console.log('Successfully removed all guild commands.');
                        await rest.put(Routes.applicationCommands(CLIENT_ID, GUILD_ID), { body: [] });
                        console.log('Successfully removed all global commands.');
                    } catch (error) {
                        console.error('Error removing all commands:', error);
                    }

                    //const guildCommands = await client.guilds.cache.get(GUILD_ID)?.commands.set([]);
                    //const globalCommands = await client.application?.commands.set([]);
                    message.reply(`Removed all commands`);
                }
                if(message.content.toLowerCase() === `${PREFIX}remove-guild-commands`){

                    try {
                        console.log('Removing all guild commands...');
                        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
                        console.log('Successfully removed all guild commands.');
                    } catch (error) {
                        console.error('Error removing guild commands:', error);
                    }

                    //await client.guilds.cache.get(GUILD_ID)?.commands.set([]);
                    message.reply(`Removed all guild commands`);
                }
                if(message.content.toLowerCase() === `${PREFIX}remove-global-commands`){
                    try {
                        console.log('Removing all commands...');
                        await rest.put(Routes.applicationCommands(CLIENT_ID, GUILD_ID), { body: [] });
                        console.log('Successfully removed all global commands.');
                    } catch (error) {
                        console.error('Error removing all commands:', error);
                    }
                    //await client.application?.commands.set([]);
                    message.reply(`Removed all global commands`);
                }
            } catch(error){
                logger.error(error);
            }
        }
                if(message.author.bot) 
                    return;
        
                /*
                if(message.content.includes('.lovense.com/c/'))
                    require('../../handlers/messageLovense.js')(client.channels.cache.get(CHAN_ID_LOVENSE), message); //channel doesn't exist, but will get overwritten in handler

                if(message.content.includes('.lovense.com/v2/'))
                    require('../../handlers/messageLovense.js')(client.channels.cache.get(CHAN_ID_LOVENSE), message); //channel doesn't exist, but will get overwritten in handler
            
                if(message.content.includes('.lovense-api.com/v2/'))
                    require('../../handlers/messageLovense.js')(client.channels.cache.get(CHAN_ID_LOVENSE), message); //channel doesn't exist, but will get overwritten in handler

                if(message.content.includes('.lovense-api.com/t2/'))
                    require('../../handlers/messageLovense.js')(client.channels.cache.get(CHAN_ID_LOVENSE), message); //channel doesn't exist, but will get overwritten in handler
                */
                
                const enabledChannels = [CHAN_ID_TOY_CONTROL, CHAN_ID_30PLUS_CONTROL, CHAN_ID_ON_DISPLAY_CHAT, CHAN_ID_PLAYROOM] ;
                //const enabledChannels = msg.client.provider.get(msg.guild, 'LinksAllowed', []);
                if (message.channel.type != ChannelType.DM && message.content.includes('.lovense-api.com/t2/')) {
                    if (enabledChannels.includes(message.channel.id) == false && enabledChannels.includes(message.channel.parent.id) == false) {
                    message.delete().catch(o_O => { console.log(o_O) });
                    return message.channel.send(`${message.author} control links are not allowed in this channel!`);
                    }
                }

                if (message.channel.type === ChannelType.DM)
                    return require('../../handlers/dmMessage')(client.channels.cache.get(CHAN_ID_VMT_BOT), message);
                
                const channelID = [CHAN_ID_TOY_CONTROL];
                let time = new Date();
                let timeText = time.toISOString().split('T')[0];
    
                for(let i = 0; i < channelID.length; i++){
                    if((message.channel.id == channelID[i])){ 
                        try {
                            const thread = await message.startThread({
                                name: `${message.member.nickname||message.member.user.username} (${timeText})`,
                                autoArchiveDuration: 10080, // For one Week 24 hours 1440 default value if not set...
                                reason: 'Comment section',
                            });
                            //await thread.setArchived(true);
                            console.log(`Created thread: ${thread.name}`);
                        } catch(error){
                            logger.error(error);
                        }
                    }
                }
    }
}