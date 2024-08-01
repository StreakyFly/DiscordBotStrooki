import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply(
            `Server name: ${interaction.guild?.name}\n
            Total members: ${interaction.guild?.memberCount}`);
    },
}
