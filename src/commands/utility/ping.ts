import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import db from '@/database';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s ping'),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const totalLatency = reply.createdTimestamp - interaction.createdTimestamp;

        // Measure database latency
        const dbStart = Date.now();
        await db.sequelize.authenticate();
        const dbEnd = Date.now();
        const dbLatency = dbEnd - dbStart;

        await interaction.editReply(
            `🏓 Pong!\`\`\`Total latency: ${totalLatency}ms\nAPI latency: ${interaction.client.ws.ping}ms\nDatabase latency: ${dbLatency}ms\`\`\``
        );
    },
};
