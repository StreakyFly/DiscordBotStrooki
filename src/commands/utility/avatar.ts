import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays a user\'s avatar')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get the avatar of')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of avatar to get')
                .setRequired(false)
                .addChoices(
                    { name: 'global avatar', value: 'global' },
                    { name: 'server avatar', value: 'server' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('size')
                .setDescription('The size of the avatar')
                .setRequired(false)
                .addChoices(
                    { name: '16', value: 16 },
                    { name: '32', value: 32 },
                    { name: '64', value: 64 },
                    { name: '128', value: 128 },
                    { name: '256', value: 256 },
                    { name: '512', value: 512 },
                    { name: '1024', value: 1024 },
                    { name: '2048', value: 2048 },
                    { name: '4096', value: 4096 }
                )
        ),
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getUser('user') || interaction.user;
        const type = options.getString('type') || 'server';
        const size = options.getInteger('size') as 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 || 1024;

        let avatarURL: string;

        if (type == 'server') {
            const member = interaction.guild?.members.cache.get(user.id);
            avatarURL = member!.displayAvatarURL({ size: size });
        } else {
            avatarURL = user.displayAvatarURL({ size: size});
        }

        const url = new URL(avatarURL);
        const baseUrl = url.origin + url.pathname.split('.').slice(0, -1).join('.');

        const pngLink = `${baseUrl}.png?size=${size}`;
        const jpgLink = `${baseUrl}.jpg?size=${size}`;
        const webpLink = `${baseUrl}.webp?size=${size}`;
        const links = `**Link:** [png](${pngLink}) | [jpg](${jpgLink}) | [webp](${webpLink})`;

        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${user.tag}'s avatar`)
            .setImage(avatarURL)
            .setDescription(links)

        await interaction.reply({ embeds: [avatarEmbed] });
    },
}
