require('dotenv').config();
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('crypto');  // To generate file hashes
const AsciiTable = require('ascii-table');
const logger = require('./Logger');

const hashFilePath = path.join(__dirname, 'commands-hash.json');  // Path to store the command hash

// Helper function to create a hash of command files
function generateCommandHash(commandFolders) {
    const hash = crypto.createHash('sha256');
    const foldersPath = path.join(__dirname, '../commands'); // Define the base command path

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        
        // Check if the current path is a directory
        if (fs.statSync(commandsPath).isDirectory()) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const fileData = fs.readFileSync(filePath);
                hash.update(fileData);
            }
        }
    }

    return hash.digest('hex');
}

// Load previously saved hash (if exists)
function loadPreviousHash() {
    if (fs.existsSync(hashFilePath)) {
        return JSON.parse(fs.readFileSync(hashFilePath));
    }
    return null;
}

// Save the current command hash
function saveCurrentHash(hash) {
    fs.writeFileSync(hashFilePath, JSON.stringify({ hash }));
}

// Check if the commands have changed
function haveCommandsChanged(commandFolders) {
    const currentHash = generateCommandHash(commandFolders);
    const previousHash = loadPreviousHash();

    if (previousHash && previousHash.hash === currentHash) {
        logger.info('No changes detected in commands, skipping registration.');
        return false;
    }

    // Save new hash since commands have changed
    saveCurrentHash(currentHash);
    return true;
}

async function registerCommands() {
    try {
        const Table = new AsciiTable('Command Registration');
        Table.setHeading('Command', 'Status');

        const foldersPath = path.join(__dirname, '../commands');
        const commandFolders = fs.readdirSync(foldersPath).filter(folder => fs.statSync(path.join(foldersPath, folder)).isDirectory());

        if (!haveCommandsChanged(commandFolders)) {
            return;  // Exit early if no changes are detected
        }

        const commands = [];  // Initialize commands array

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    Table.addRow(command.data.name, '🟢 Registered');
                } else {
                    Table.addRow(file, '🔴 Failed', 'Missing data or execute function');
                }
            }
        }

        logger.info(`Command registration:\n${Table.toString()}`);
        const rest = new REST().setToken(TOKEN);
        const response = await rest.put(
            Routes.applicationCommands(CLIENT_ID, GUILD_ID),  // Or Routes.applicationCommands for global
            { body: commands },
        );

        logger.info(`Successfully registered ${response.length} commands.`);
    } catch (error) {
        logger.error(`Error registering commands: ${error}`);
    }
}

module.exports = { registerCommands };