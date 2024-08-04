import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays a list of commands"),
    async execute(interaction: CommandInteraction) {
        await interaction.reply( { content: "Help command is not implemented yet cuz it's the most boring command ever...", ephemeral: true });
    },
}
