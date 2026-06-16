const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } = require("discord.js"); // This is to send the image via discord.

const logger = require('../../util/Logger.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
//const { arrayBuffer } = require("stream/consumers");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('token-toplist')
      .setDescription('Request the leaderboard')
      .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
      .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
      .addUserOption(option => option.setName('user').setDescription('Show the toplist place of the mentioned user').setRequired(false)),

	async execute(interaction) {
        await interaction.reply('Loading Leaderboard...');
        // const message = await interaction.fetchReply(); -- Not Used
        let page = 1;
    try {

      const client = interaction.client;
      
      let mentioned = await interaction.options.getUser('user');
      if(!mentioned) {
        mentioned = interaction.member.user;
      }
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

      let topQuery = `SELECT * FROM token_balance WHERE discord_guild_id='${interaction.guild.id}' ORDER BY balance DESC LIMIT 10 OFFSET ${offset}`;
      // const top10 = DB.query(topQuery, async function (err, result, fields) { -- Not Used top10
      result = await getDataFromDB(topQuery);
      // console.log(result);

        if (!result.length) {
          interaction.editReply(`No data on our system for this page ( ${page} ) .`);
          return false;
        }

        let title = `Token Toplist (Top #10)`;
        if(page>1) {
          title = `Token Toplist (Top #${offset}-${offset+result.length})`
        }
        const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setAuthor({name: client.user.id, iconURL: client.user.avatarURL()})
        .setThumbnail('https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4b0.png')
        .setDescription(`${description}`)

        let topN = "";
        let topM = "";
        // let topA = ""; -- Not Used
        let topR = page*10-10;
        //let arr =[];

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
              if (topN == "Unknown User"){
                
                /* change to update correct database
                let query = `UPDATE coins SET deactivated=1 WHERE user=${el.discord_user_id}`;
                logger.info(`${query}`);
                console.log(`${query}`);
                let ret = getDataFromDB(query);
                logger.info(`(leaderboard::run) user deactivated for leaderboard sql='${ret}'`);
                */
              }
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
              if (topN == "Unknown User"){
                /* change to update correct database
                let query = `UPDATE coins SET deactivated=1 WHERE user=${el.discord_user_id}`;
                logger.info(`${query}`);
                console.log(`${query}`);
                let ret = getDataFromDB(query);
                logger.info(`(leaderboard::run) user deactivated for leaderboard sql='${ret}'`);
                */
              }
            }
          }
          //embed.addFields(`#${topR} - ${topN}`, `[${(el.total || 0)} xp | ${(el.rankDiscord || "Level 1")} | ${topRank}] - <@${topM}>`)
          //arr.push ({ name: `#${topR} - ${topN}`, value: `[${(el.total || 0)} xp | ${(el.rankDiscord || "Level 1")} | ${topRank}] - <@${topM}>` }, );
  
          embed.addFields([
            { name: `#${topR} - ${topN}`, value: `${(el.balance || 0)} token | <@${topM}>` },
          ]);        
        });
        //embed.addFields(arr);
        embed.setFooter({text: `🏅 Page: ${page} of ${pages}`});
        
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('leaderboardfirst')
            //.setLabel('')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏮'),
          new ButtonBuilder()	
            .setCustomId('leaderboardprevious')
            //.setLabel('')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏪'),
          new ButtonBuilder()
            .setCustomId('leaderboardnext')
            //.setLabel('')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏩'),
          new ButtonBuilder()
            .setCustomId('leaderboardlast')
            //.setLabel('')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏭'),
        );
        await interaction.editReply({content: ` `, embeds: [embed], components: [row] });
        return;
    } catch (e) {
      interaction.editReply(`An error has occured (The database is most likely not ready yet). Try waiting for a moment before retrying. Error: (${e})`);
      console.log(`${e}`);
    }
  }
}