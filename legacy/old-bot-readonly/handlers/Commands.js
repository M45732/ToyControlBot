require('dotenv').config();
//const { REST, Routes, Collection } = require('discord.js');  // Import Collection if needed elsewhere
//const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
const Ascii = require("ascii-table");
const logger = require(`../util/Logger`);
const fs = require('node:fs');
const path = require('node:path');

async function commands(client) {  // Accept client as a parameter
    try {
        const Table = new Ascii("Commands Loaded");
        const commandsPath = path.resolve(__dirname, '../commands');
        const commandFolders = fs.readdirSync(commandsPath);
        const commands = [];

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${commandsPath}//${folder}`).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`${commandsPath}//${folder}//${file}`);

                // Validate command has required properties
                if (!command.data || !command.execute) {
                    Table.addRow(command.data?.name || file, '🔴 Failed', 'Missing data or execute function');
                    continue;
                }

                // Push command data to the list to be registered
                commands.push(command.data.toJSON());

                // Register command in client.commands collection
                client.commands.set(command.data.name, command);  // Add this line to store the command

                Table.addRow(command.data.name, '🟢 SUCCESSFUL');
            }
        }

        // Log the status of command loading
        logger.info(`Commands:\n${Table.toString()}`);
        
        // If desired, register the commands (for testing, register in a guild)
        // You can uncomment this if you want to register commands
        /*
        const rest = new REST().setToken(TOKEN);

        const response = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),  // Or Routes.applicationCommands for global commands
            { body: commands },
        );

        logger.info(`Successfully registered ${response.length} commands.`);
        */
    } catch (error) {
        logger.error(`(handlers::Commands) Something went wrong: ${error}`);
    }
}

module.exports = {
    commands,
};