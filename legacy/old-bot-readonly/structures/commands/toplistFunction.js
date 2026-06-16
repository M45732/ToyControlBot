const { EmbedBuilder } = require('discord.js');
const { getDataFromDB } = require('../sql/Pool.js');

const logger = require(`../../util/Logger.js`);

const leaderboardFunction = async (interaction) => {
    try{
        await interaction.deferUpdate();
        const medal = ( interaction.message.embeds[0] && interaction.message.embeds[0].footer && interaction.message.embeds[0].footer.text && interaction.message.embeds[0].footer.text.startsWith('🏅'));
        // const startpage = interaction.message.embeds[0].footer.text.indexOf('🏅 Page: '); -- Not Used
        const endpage = interaction.message.embeds[0].footer.text.indexOf(' of ');
        const slicestart = interaction.message.embeds[0].footer.text.slice(9, endpage);
        const arrayFooter = interaction.message.embeds[0].footer.text.split(' ');
        const lastpage = arrayFooter[4];
        let pagenext = ``;

        if(interaction.customId === 'leaderboardprevious'){
            if(slicestart != 1){
                pagenext = parseInt(slicestart)-1;
            } else {
                pagenext = 1;
            }
        } else if(interaction.customId === 'leaderboardnext'){
            pagenext = parseInt(slicestart)+1
        } else if(interaction.customId === 'leaderboardfirst'){
            pagenext = 1
        } else if(interaction.customId === 'leaderboardlast'){
            pagenext = lastpage;
        }

        let page = pagenext;
        if (medal) {
            
            try {
                const client = interaction.message.client;

                /* let mentioned = await interaction.options.getUser('user');
                if(!mentioned) {
                  mentioned = interaction.member.user;
                }*/

                /*
                let mentioned = interaction.message.mentions.users.first()

                  //let member = interaction.guild.members.cache.get(mentioned.id);
                  let query = `SELECT discord_user_id,
                  (SELECT COUNT(*) FROM token_balance WHERE discord_user_id <= '${mentioned.id}' AND discord_guild_id='${interaction.guild.id}') AS position,
                  discord_user_id
                  FROM token_balance
                  WHERE discord_user_id = '${mentioned.id}' AND discord_guild_id='${interaction.guild.id}'`;
                  logger.info(`(leaderboard::run) query: ${query}`);
                  let result2 = await getDataFromDB(query);
                  // DB.query(query, [sender, recipient], async function (err, result) {
                  let description = ``;
                  if (!result2[0]) { //if the user not in the list
                    description = `User has no token.`;
                  } else {
                    description = `<@${result2[0].discord_user_id}> is #${result2[0].position} in the toplist`;
                  }


                  */

                // let score = {level: 1, xp: 0}; -- Not Used
                let offset = Math.max((page-1) * 10,0);
                let Query2 = `SELECT * FROM token_balance WHERE discord_guild_id='${interaction.guild.id}' ORDER BY balance`;
                // const entries = DB.query(Query2, function (err, result, fields) { -- Not Used entries
                let result = await getDataFromDB(Query2);
                let entries2 = result.length;

                const pages = Math.ceil(entries2 / 10);

                if(page > pages) {
                    page = pages;
                    offset = Math.max((page-1) * 10,0);
                }

                // WHERE AND deactivated='0'
                let topQuery = `SELECT * FROM token_balance WHERE discord_guild_id='${interaction.guild.id}' ORDER BY balance DESC LIMIT 10 OFFSET ${offset}`;
                // const top10 = DB.query(topQuery, async function (err, result, fields) { -- Not Used top10
                result = await getDataFromDB(topQuery);


                let title = `Token Toplist (Top #10)`;
                if(page>1) {
                  title = `Token Toplist (Top #${offset}-${offset+result.length})`
                }
                const embed = new EmbedBuilder()
                .setTitle(`${title}`)
                .setAuthor({name: client.user.username, iconURL: client.user.avatarURL()})
                .setThumbnail('https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4b0.png')
                //.setDescription(`${description}`)
        
                let topN = "";
                let topM = "";
                // let topA = ""; -- Not Used
                let topR = page*10-10;
                result.forEach(el => {
                    //const test = client.user.fetch(`${el.discord_user_id}`);
                    topR += 1;
                    //topA = client.users.avatarURL();

                    if( el.discord_id !== null) {

                    //member = msg.guild.members.cache.has(el.discord_user_id);
        
                            //if(member == true) {
                                
                            
        
                    //if(msg.guild.members.cache.has(`${el.discord_user_id}`)){
                        //topM = client.users.cache.get(`${el.discord_user_id}`);
                        //topM = msg.member.get(`${el.discord_user_id}`);
                    //}else{
                        topM = client.users.cache.get(`${el.discord_user_id}`);
                    //}
                    if(topM) {
                        topN = topM.username;
                        topM = topM.id;
                    } else {
                        topN = el.display_name || "Unknown User";
                        topM = el.display_name || el.discord_user_id;
                    }
        
                    } else {
                    //if (msg.guild.members.cache(el.discord_id).exists){
                    //if (client.guild.member(el.discord_id).exists){
        
                    //if(msg.guild.members.cache.has(`${el.discord_user_id}`)){
                    // member = msg.guild.members.cache.has(el.discord_user_id);
        
                        //if(member == true) {
                        //topM = client.users.cache.get(`${el.discord_user_id}`);
                        //topM = msg.member.get(`${el.discord_user_id}`);
                    //}else{
                        topM = client.users.cache.get(`${el.discord_user_id}`);
                    //}
                    if(topM) {
                        topN = topM.username;
                        topM = topM.id;
                    } else {
                        topN = el.display_name || "Unknown User";
                        topM = el.display_name || el.discord_user_id;
                    }
                    }
                    //embed.addFields(`#${topR} - ${topN}`, `[${(el.total || 0)} xp | ${(el.rankDiscord || "Level 1")} | ${topRank}] - <@${topM}>`);
                    embed.addFields([
                        { name: `#${topR} - ${topN}`, value: `${(el.balance || 0)} token | <@${topM}>` },
                        ]);
                });
                embed.setFooter({text: `🏅 Page: ${page} of ${pages}`});

                const wait = require('util').promisify(setTimeout);

                await wait(500);

                await interaction.editReply({embeds: [embed]});
                return;
            } catch (e) {
                
                await interaction.editReply(
                `An error has occured (The database is most likely not ready yet). Try waiting for a moment before retrying. Error: (${
                    e
                })`
                )
                console.log(`${e}`);
                return;
            }
        }
    }catch(e){
        logger.error(`(leaderboardFunction::run) something went wrong: ${e}`);
        return;
    }
}

module.exports = {
    leaderboardFunction,
}