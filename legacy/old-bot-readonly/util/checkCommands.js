require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
const rest = new REST({ version: '10' }).setToken(TOKEN);


(async () => {
    try {
        const commands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
        console.log(commands);

    } catch (error) {
        console.error(error);
    }
})();