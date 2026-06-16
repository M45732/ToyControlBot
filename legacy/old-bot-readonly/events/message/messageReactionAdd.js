const logger = require('../../util/Logger');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user, client){
        // When a reaction is received, check if the structure is partial
        if (reaction.partial)
        try { await reaction.fetch() } catch (error) { return console.log('Something went wrong when fetching the message: ', error) }

    if(user.bot)
        return;
        
    //if(!client.provider.get('global', reaction.message.id))
        return;
    /** 
    if(reaction.emoji.name == "👍"){

        //let links = client.provider.get('global', reaction.message.id);
        let links = reaction.message.id;
        countDown(reaction.message);
        //client.provider.remove('global', reaction.message.id)
*/
        /** 
        reaction.message.awaitReactions({ max: 4, time: 60000, errors: ['time'] })
            .then(collected => console.log(collected.size))
            .catch(collected => {
                console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
            });
*/
/**
reaction.message.awaitReactions((reaction, user) => !user.bot, {time: 30 * 1000}).then(reactions => {
    let participants = reactions.array().map(r => r.users.cache.array().filter(u => !u.bot)).flat();
    if(!participants.includes(user))
        participants.push(user)

    let winner = participants[Math.floor(Math.random() * participants.length)];
            winner.send('You were randomly selected. Here is the control link: ' + links).catch(() => {reaction.message.channel.send('The winner has DMs deactivated, here is the link: ' + links)});
            reaction.message.reactions.removeAll()
        })

    } else {
        return
    }
    */
    //if(reaction.name != "✅")
        //return;

}
}


function countDown(message){
    console.log('Triggered')
    let embed = message.embeds[0];
    let timeLeft = 25;
    let updateInterval = setInterval(() => {
        if(timeLeft <= 0){
            embed.setDescription(`**Expired**: Link was sent to a member`);
            message.edit({ embeds: [embed]});
            clearInterval(updateInterval);
        }else{
            embed.setDescription(`Link will be randomly sent in **${timeLeft}** seconds`)
            message.edit({ embeds: [embed]});
        }
        timeLeft-=5;
        
    }, 5000);
}
