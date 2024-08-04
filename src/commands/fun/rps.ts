import {
    SlashCommandBuilder,
    CommandInteraction, CommandInteractionOptionResolver,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle
} from "discord.js";
import { rpsService } from '@/database/services'

/*
TODO
  - Add a cooldown or limit to 1 game per user at a time
  - If "/rps play" is used but option user is not set, play against a bot
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play rock-paper-scissors with another user or view user\'s stats')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play rock-paper-scissors with another user')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('The user to play against')
                        .setRequired(true)
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Display user\'s rock-paper-scissors stats')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to view stats for')
                ),
        ),
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case 'play':
                await playRPS(interaction, options);
                break;
            case 'stats':
                await viewStats(interaction, options);
                break;
        }
    }
}

async function playRPS(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
    const player1 = interaction.user;
    const player2 = options.getUser('opponent')!;

    if (player1.id === player2.id) {
        return interaction.reply({
            content: 'You can\'t play with yourself! :sweat_smile:',
            ephemeral: true
        });
    }

    const playersString = `Players: **${player1.displayName}** vs **${player2.displayName}**`;
    const title = 'Rock Paper Scissors';
    const countdownDuration = 30;  // seconds
    const endTimestamp = `<t:${Math.floor(Date.now() / 1000) + countdownDuration}:R>`;
    const actionEmojis: { [key: string]: string } = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    }

    const messageEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${playersString}\n\nTime remaining: ${endTimestamp} ⌛`)
        .setColor('Blue');

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('rock')
                .setLabel('Rock')
                .setEmoji(actionEmojis.rock)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('paper')
                .setLabel('Paper')
                .setEmoji(actionEmojis.paper)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('scissors')
                .setLabel('Scissors')
                .setEmoji(actionEmojis.scissors)
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({
        content: `<@${player1.id}> vs <@${player2.id}>`,
        embeds: [messageEmbed],
        components: [row],
        allowedMentions: { users: [player1.id, player2.id] }
    });

    const collector = interaction.channel?.createMessageComponentCollector({ time: countdownDuration * 1000 });

    const choices: { [key: string]: string | null } = {
        [player1.id]: null,
        [player2.id]: null
    };

    collector?.on('collect', async (i: any) => {
        if (![player1.id, player2.id].includes(i.user.id)) {
            return i.reply({
                content: 'You are not a part of this game! :pensive:\nTo start a new game, use the `/rps play` command.',
                ephemeral: true
            });
        }

        choices[i.user.id] = i.customId;

        if (choices[player1.id] && choices[player2.id]) {
            collector.stop();

            const p1Choice = choices[player1.id];
            const p2Choice = choices[player2.id];

            let result: string;
            let color: 'Green' | 'Yellow';
            if (p1Choice === p2Choice) {
                result = 'It\'s a tie! :handshake:';
                color = 'Yellow';
                await rpsService.addTie(player1.id);
                await rpsService.addTie(player2.id);
            } else if (
                (p1Choice === 'rock' && p2Choice === 'scissors') ||
                (p1Choice === 'paper' && p2Choice === 'rock') ||
                (p1Choice === 'scissors' && p2Choice === 'paper')
            ) {
                result = `**${player1.displayName}** wins! :crown:`;
                color = 'Green';
                await rpsService.addWin(player1.id);
                await rpsService.addLoss(player2.id);
            } else {
                result = `**${player2.displayName}** wins! :crown:`;
                color = 'Green';
                await rpsService.addWin(player2.id);
                await rpsService.addLoss(player1.id);
            }

            messageEmbed
                .setDescription(
                    `${player1.displayName} chose **${p1Choice}** ${actionEmojis[p1Choice!.toString()]}\n` +
                    `${player2.displayName} chose **${p2Choice}** ${actionEmojis[p2Choice!.toString()]}\n\n` +
                    `${result}`)
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
                .setDescription(playersString + '\n\nGame timed out. Not all players made a choice.')
                .setColor('Red');
            await interaction.editReply({ embeds: [messageEmbed], components: [] });
        }
    });
}

async function viewStats(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
    const user = options.getUser('user') || interaction.user;

    const playerStats = await rpsService.getPlayerStats(user.id);

    const nonTieGames = playerStats.wins + playerStats.losses;
    const totalGames = nonTieGames + playerStats.ties;
    const winRate = totalGames === 0 ? 0 : parseFloat(((Number(playerStats.wins) / nonTieGames) * 100).toFixed(2));

    const winRateEmojis = [
        '💩',  // 0-9%
        '😢',  // 10-19%
        '😟',  // 20-29%
        '😐',  // 30-39%
        '🙂',  // 40-49%
        '😊',  // 50-59%
        '😀',  // 60-69%
        '😄',  // 70-79%
        '😁',  // 80-89%
        '👑'   // 90-100%
    ];

    const winRateEmojiIndex = Math.min(Math.floor(winRate / 10), 9);
    const winRateWithEmoji = `${winRate}% ${winRateEmojis[winRateEmojiIndex]}`;

    const messageEmbed = new EmbedBuilder()
        .setTitle('📊  |  Rock Paper Scissors Stats')
        .setDescription(`Player: <@${user.id}>\n\n` +
            `**Wins**: ${playerStats.wins}\n` +
            `**Losses**: ${playerStats.losses}\n` +
            `**Ties**: ${playerStats.ties}\n\n` +
            `**Current | Longest Streak**\n` +
            ` ↳ **Win**: ${playerStats.currentWinStreak} | ${playerStats.longestWinStreak}\n` +
            ` ↳ **Loss**: ${playerStats.currentLossStreak} | ${playerStats.longestLossStreak}\n` +
            ` ↳ **Tie**: ${playerStats.currentTieStreak} | ${playerStats.longestTieStreak}\n\n` +
            `**Total Games**: ${totalGames}\n` +
            `**Win Rate**: ${winRateWithEmoji}`
        )
        .setColor('Blue');

    await interaction.reply({ embeds: [messageEmbed] });
}
