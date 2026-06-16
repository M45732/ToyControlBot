require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
    try {
        //await rest.put(Routes.applicationCommands(CLIENT_ID), {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: [] // Clears all commands for the specific guild
        });
        console.log('Successfully cleared all guild commands');
    } catch (error) {
        console.error(error);
    }
})();