require('dotenv').config();
//const { STATCORDAPIKEY } = process.env;
const { Events } = require ("../validation/EventNames");
const Ascii = require("ascii-table");
//const Statcord = require("statcord.js");
const logger = require(`../util/Logger`);
const fs = require('node:fs');
const path = require('node:path');

async function events (client) {
    try{
        const Table = new Ascii("Events Loaded");

        client.on("ready", async () => {
            //statcord.autopost();
        });
        
        const eventsPath = path.resolve(__dirname, '../events');
        //const eventsPath = path.resolve(process.cwd(), '../ToyControlBot/events');
        
        const directorys = fs.readdirSync(eventsPath);

        for (const directory of directorys) {
            let eventFiles = fs.readdirSync(`${eventsPath}//${directory}`);
            
            for(let i in eventFiles) {
                const event = require(`${eventsPath}//${directory}//${eventFiles[i]}`);

                if(!Events.includes(event.name) || !event.name) {
                    const L = eventFiles[0].split("/");
                    await Table.addRow(`${event.name || "Missing"}`, `🔴 Event name is either invalid or missing: ${L[6] + `/` + L[7]}`);
                    return;
                }
    
                if(event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
    
                await Table.addRow(event.name, "🟢 SUCCESSFUL")
            }
        }

        logger.info(`Events:\n${Table.toString()}`);
    }catch(e){
        logger.error(`(Events::run) something went wrong: ${e}`);
        return;
    }
}

module.exports = {
    events,
}