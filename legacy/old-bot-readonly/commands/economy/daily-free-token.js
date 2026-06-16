const { ActionRowBuilder, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const prettyMs = require('pretty-ms')
const logger = require('../../util/Logger.js');
const { getDataFromDB } = require('../../structures/sql/Pool.js');
const { ROLE_VERIFIED_ID, ROLE_PATRON } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get daily free token')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    //.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    //.setContexts([0, 1, 2])
    //.setIntegrationTypes([0, 1])
    //.addUserOption(option => option.setName('user').setDescription('Show the profile of the mentioned user').setRequired(false)),
    

	async execute(interaction) {
        await interaction.reply('Loading daily...');
        // const message = await interaction.fetchReply(); -- Not Used

        try {
    
            //ask if the member has the verified role id ROLE_VERIFIED_ID, add daily token
            if (interaction.member.roles.cache.has(ROLE_VERIFIED_ID)) {
                //
                
                /*
                let query = `SELECT u.user_id as wp_id, r.coins as coins, s.lastRedeem as lastRedeem, s.streakDay as streakDay, \
                            TIME_TO_SEC(TIMEDIFF(s.nextRedeem, UTC_TIMESTAMP)) AS remainingTime \
                            FROM ( \
                            SELECT user, DATE_FORMAT(DATE_ADD(lastRedeem, INTERVAL 1 DAY), '%Y-%m-%d 00:00:00' \
                            ) AS nextRedeem, lastRedeem, streakDay FROM coins WHERE USER = ${sender}) s \
                            JOIN coins r ON r.user = ${recipient} \
                            LEFT JOIN d4Q0J_discord_users u ON r.user = u.discord_id`;
                            */
                let query = `SELECT discord_user_id, last_redeem, discord_guild_id, 
                TIME_TO_SEC(TIMEDIFF(DATE_FORMAT(DATE_ADD(last_redeem, INTERVAL 1 DAY), '%Y-%m-%d 00:00:00' ), UTC_TIMESTAMP)) AS remaining_time, 
                DATE_FORMAT(DATE_ADD(last_redeem, INTERVAL 1 DAY), '%Y-%m-%d 00:00:00' ) AS next_redeem 
                FROM daily_token WHERE discord_user_id = ${interaction.member.id}`;

                logger.debug(`(daily::run) query1: ${query}`);
                let result = await getDataFromDB(query);
                // DB.query(query, [sender, recipient], async function (err, result) {
                let remaining_time = 1;
                let next_redeem = 0;
                if (!result[0]) { //if the user not in the list

                    //if user is not in the list, add user to db
                    let query2 = `INSERT INTO daily_token (discord_user_id, last_redeem, discord_guild_id) VALUES (${interaction.member.id}, UTC_TIMESTAMP(), ${interaction.guild.id})`; //add user to db
                    await getDataFromDB(query2); //await query
                    remaining_time = 0;
                } else { // update db record
                    remaining_time = result[0].remaining_time * 1000;
                    next_redeem = result[0].next_redeem;
                    if (remaining_time>0) { //if the user redeemed today, return message
                        return interaction.editReply(`You already received your daily token! Next redeem in ${prettyMs(remaining_time)}`);
                    } else { //else update lastredeem
                        let query2 = `UPDATE daily_token SET last_redeem = UTC_TIMESTAMP() WHERE discord_user_id = '${interaction.member.id}'`;
                        await getDataFromDB(query2); //await query
                    }
                }

                    const dailyEmbed = new EmbedBuilder();
                    dailyEmbed.setTitle(`Daily token`);
                    let token = 0;

                      
                        //if member is booster, add additional token
                        if (interaction.member.premiumSinceTimestamp) {
                            token = token + 100;
                            dailyEmbed.addFields({name: 'Server Booster', value: '✅ +100 token bonus', inline: true});
                        }else{
                            dailyEmbed.addFields({name: 'Server Booster', value: '❌ Boost for an addtional +100 token', inline: true});
                        }
                        //if member is patron, add 1 daily token
                        if (interaction.member.roles.cache.has(ROLE_PATRON)) {
                            token = token + 100;
                            dailyEmbed.addFields({name: 'Patron', value: '✅ +100 token bonus', inline: true});
                        }else{
                            dailyEmbed.addFields({name: 'Patron', value: '❌ Patrons get an addtional +100 tokens', inline: true});
                        }


                        if (remaining_time<0) { 
                            token = token + 100;
                            dailyEmbed.setDescription(`You received 100 token, plus optional bonus token listed below:`);  
                        } else {
                            dailyEmbed.setDescription(`You already received your daily token! Next redeem in ${prettyMs(remaining_time)}`);
                        }
                        dailyEmbed.addFields({name: 'Total', value: `${token} token`, inline: false});
                        //dailyEmbed.setFooter({text: `Next redeem in ${prettyMs(remaining_time)}`});
                        dailyEmbed.setColor('#0099ff');
                        dailyEmbed.setTimestamp();
                        //add a button to the embed
						let row = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setLabel('🌐 Become a Patron')
								.setStyle(ButtonStyle.Link)
                                .setURL('https://www.patreon.com/vibemytoy'),
						);

                        let query2 = `INSERT INTO token_history (discord_guild_id, discord_user_id, token_amount, event_type, event_id, timestamp) VALUES (${interaction.guild.id}, ${interaction.member.id}, ${token}, 'daily', ${interaction.id}, UTC_TIMESTAMP())`; //add entry to db
                        await getDataFromDB(query2); //await query

                        /*
                        let query3 = `INSERT INTO coins (discord_user_id, lastredeem, discord_guild_id) VALUES (${interaction.member.id}, UTC_TIMESTAMP(), ${interaction.guild.id})`; //add user to db
                        await getDataFromDB(query3); //await query
                        */

                        return interaction.editReply({ content:"Daily successful", embeds: [dailyEmbed], components: [row]});
                        //return interaction.editReply(``); //send message

                } else {
                    return interaction.editReply(`You are not verified! Please verify to get free Daily Tokens + Bonus Tokens!`, { verbose: true });
                }

        } catch (e) {
            logger.error(`(daily::run) DB Error: ${e}`);
            return interaction.editReply(`Error while sending token! Please contact the server admin, ${e}`);
            //msg.say(`This user doesn't have any xp!, ${e}`);
        }
	}
}