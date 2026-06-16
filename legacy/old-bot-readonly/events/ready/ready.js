const { GUILD_ID, PREFIX } = process.env;
const logger = require('../../util/Logger');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
const { execute, Lovense_ReactionVote } = require('../../structures/commands/toyControl.js'); 
const packages = require('../../package.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client){
        // Set and Reload Slash Commands on Bot Start
        /*
        try {
            const commandsData = client.commands.map(({execute, ...data }) => data);
            await client.application?.fetch();
            const commands = await client.guilds.cache.get(GUILD_ID)?.commands.set(commandsData);
            logger.info(`Reloaded and Deployed Slash Commands`);
        } catch(error) {
            logger.error(`There was an error on Reloading and Deploying Slash Commands: ${error}.`);
        }
        */
        //let array = Array.from(client.guilds.cache)
        //let array = Object.values(client.guilds.cache)
        let array = [...client.guilds.cache.keys()]
        let guilds = array.join(' AND discord_guild_id=');
        let query = `SELECT discord_channel_id, discord_guild_id, discord_message_id, discord_user_ids, session_active, session_mode, session_type, toy_speed FROM toycontrol WHERE discord_guild_id=${guilds}`;
        let configquery = await getDataFromDB(query);
        //config = await configquery[0];
        if(configquery.length !== 0){
            for(let session of configquery){
                try{
                    let sessionMsg = await client.channels.cache.get(session.discord_channel_id).messages.fetch(session.discord_message_id);
                    Lovense_ReactionVote(session, sessionMsg);
                } catch(err) {
                    

                    let query2 = `SELECT discord_message_id, discord_user_id FROM toycontrol_user WHERE discord_message_id=${session.discord_message_id}`;
                    let query_sessions2 = await getDataFromDB(query2);
                    let sessionfound = query_sessions2[0];
            
                    //if there are no other user found in the toycontrol session, delete the session
                    if(sessionfound === undefined){
            
                        let queryToyControl = `SELECT discord_message_id, discord_channel_id FROM toycontrol WHERE discord_message_id=${session.discord_message_id}`;
                        let queryToyControl2 = await getDataFromDB(queryToyControl);
                        let queryToyControl3 = queryToyControl2[0];
            
                        let querydelete = `DELETE FROM toycontrol WHERE discord_message_id=${queryToyControl3.discord_message_id}`;
                        await getDataFromDB(querydelete);

                    }
                    
                    console.log( 'Err',err );
                }
            /*		
                client.channels.fetch(session.discord_channel_id).then(channel => {
                    channel.messages.delete(session.discord_message_id);
                });
            */
                
            }
            logger.warn(`Sessions restored: ${configquery.length}`);
        }

        // Show on the Console that the Bot is Ready
        //logger.warn(`Ready! Loged in as ${client.user.tag}`);
        if (client.user) {
            logger.warn(`(ready::run) [READY]\nPrefix: **${PREFIX}**\nBot Account:<@${client.user.id}>\nBot ID: **${client.user.id}**\nRunning version: **${packages.version}**`);
        } else {
            logger.warn(`(ready::run) [READY]\nPrefix: ${PREFIX}\nLogged in.\nRunning version: **${packages.version}**`);
        }


        const { registerCommands } = require('../../util/registerCommands');  // Adjust path as needed

            await registerCommands(client);  // Register commands only if they have changed
            console.log(`${client.user.tag} is online and ready!`);
        

    },
};