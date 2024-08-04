import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin'),
    async execute(interaction: CommandInteraction) {
        const landedOn = Math.random() < 0.5 ? 'heads' : 'tails';
        const messageEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.displayName} flipped a coin.`)
            .setDescription(`The coin landed on **${landedOn}**!`);
        await interaction.reply({ embeds: [messageEmbed] });
    },
}
