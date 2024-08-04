import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Displays a user\'s info'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply(
            `Tag: ${interaction.user.tag}\n
            ID: ${interaction.user.id}\n
            Created: ${interaction.user.createdAt}`);
    },
}
