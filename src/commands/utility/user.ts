import { SlashCommandBuilder, CommandInteraction } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply(
            `Tag: ${interaction.user.tag}\n
            ID: ${interaction.user.id}\n
            Created: ${interaction.user.createdAt}`);
    },
}
