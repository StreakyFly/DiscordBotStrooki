import { DiscordClient } from "./discordClient";

declare module 'discord.js' {
    interface Client {
        commands: DiscordClient['commands'];
    }
}
