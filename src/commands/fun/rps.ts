import {
    SlashCommandBuilder,
    CommandInteraction, CommandInteractionOptionResolver,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle
} from "discord.js";
import { rpsService } from '@/database/services'

// TODO subcommands play, stats

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play rock-paper-scissors with another user.')
        .addUserOption(option =>
            option
                .setName('opponent')
                .setDescription('The user to play against')
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const player1 = interaction.user;
        const player2 = options.getUser('opponent')!;

        if (player1.id === player2.id) {
            return interaction.reply({ content: 'You can\'t play with yourself!', ephemeral: true });
        }

        const participantsString = `Participants: **${player1.username}** vs **${player2.username}**`;
        const title = 'Rock Paper Scissors';
        const countdownDuration = 16;  // seconds
        const endTimestamp = `<t:${Math.floor(Date.now() / 1000) + countdownDuration}:R>`;

        const messageEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`${participantsString}\n\nClick a button to make your choice!\n\nTime remaining: ${endTimestamp}`)
            .setColor('Blue');

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rock')
                    .setLabel('Rock')
                    .setEmoji('🪨')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('paper')
                    .setLabel('Paper')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('scissors')
                    .setLabel('Scissors')
                    .setEmoji('✂️')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [messageEmbed], components: [row] });

        const filter = (i: any) => {
            return [player1.id, player2.id].includes(i.user.id);
        };

        const collector = interaction.channel?.createMessageComponentCollector({ filter, time: countdownDuration * 1000 });

        const choices: { [key: string]: string | null } = {
            [player1.id]: null,
            [player2.id]: null
        };

        collector?.on('collect', async (i: any) => {
            choices[i.user.id] = i.customId;

            if (choices[player1.id] && choices[player2.id]) {
                collector.stop();

                const p1Choice = choices[player1.id];
                const p2Choice = choices[player2.id];

                let result: string;
                let color: 'Green' | 'Yellow';
                if (p1Choice === p2Choice) {
                    result = 'It\'s a tie!';
                    color = 'Yellow';
                    await rpsService.incrementTies(player1.id);
                    await rpsService.incrementTies(player2.id);
                } else if (
                    (p1Choice === 'rock' && p2Choice === 'scissors') ||
                    (p1Choice === 'paper' && p2Choice === 'rock') ||
                    (p1Choice === 'scissors' && p2Choice === 'paper')
                ) {
                    result = `**${player1.username}** wins!`;
                    color = 'Green';
                    await rpsService.incrementWins(player1.id);
                    await rpsService.incrementLosses(player2.id);
                } else {
                    result = `**${player2.username}** wins!`;
                    color = 'Green';
                    await rpsService.incrementWins(player2.id);
                    await rpsService.incrementLosses(player1.id);
                }

                messageEmbed
                    .setDescription(`${participantsString}\n\n${player1.username} chose **${p1Choice}**\n${player2.username} chose **${p2Choice}**\n\n${result}`)
                    .setColor(color);

                await i.update({ embeds: [messageEmbed], components: [] });
            } else {
                await i.deferUpdate();
            }
        });

        collector?.on('end', async () => {
            if (!choices[player1.id] || !choices[player2.id]) {
                messageEmbed
                    .setTitle(title + ' - Timed Out')
                    .setDescription(participantsString + '\n\nGame timed out. Not all players made a choice.')
                    .setColor('Red');
                await interaction.editReply({ embeds: [messageEmbed], components: [] });
            }
        });
    }
}
