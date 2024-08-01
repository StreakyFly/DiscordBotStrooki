import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Events, GatewayIntentBits } from 'discord.js';
import { DiscordClient } from './types/discordClient';

const client = new DiscordClient({
    intents: [GatewayIntentBits.Guilds],
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
})

// client.once(Events.ClientReady, readyClient => {
//     console.log(`Ready! Logged in as ${readyClient.user.tag}.`);
// })

client.login(process.env.BOT_TOKEN).then(r => {
    console.log(`Ready! Logged in as ${client.user?.tag}.`);
});
