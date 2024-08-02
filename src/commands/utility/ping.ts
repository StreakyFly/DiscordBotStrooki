import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s ping!'),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const totalLatency = reply.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(
            `🏓 Pong!\`\`\`Total latency: ${totalLatency}ms\nAPI latency: ${interaction.client.ws.ping}ms\`\`\``
        );
    },
};
