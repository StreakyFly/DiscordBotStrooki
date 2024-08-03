import 'dotenv/config';
import fs from 'fs';
import path from 'path';
// import { fileURLToPath, pathToFileURL } from 'node:url';
import { GatewayIntentBits } from 'discord.js';
import { DiscordClient } from './types/discordClient';
import db from './database';

// Initialize the database
db.initialize()
    .then(() => {
        console.log('Database initialized successfully.');
    })
    .catch(error => {
        console.error('Error initializing the database:\n', error);
        console.log('Exiting...');
        process.exit(1);
    });

// Create a new Discord client
const client = new DiscordClient({
    intents: [GatewayIntentBits.Guilds],
});

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load all command files
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // let command = await import(pathToFileURL(filePath).href);
        // command = command.default;
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load all event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    // let event = await import(pathToFileURL(filePath).href);
    // event = event.default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

export default client;
