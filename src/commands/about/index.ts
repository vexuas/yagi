import { SlashCommandBuilder } from '@discordjs/builders';
import { format } from 'date-fns';
import { BOT_VERSION } from '../../version';
import { AppCommand, AppCommandOptions } from '../commands';

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Displays information about Yagi'),
  async execute({ interaction, yagi }: AppCommandOptions) {
    console.log('about command');
    try {
      const embed = {
        title: 'Info',
        description: `Hi there! I'm Yagi and I provide information for the world bosses of Vulture's Vale and Blizzard Berg in Aura Kingdom EN!\n\nInitially my creator only wanted to make a [website](https://ak-goats.com/) but eventually opted to make a discord version as well! Since then I'm currently serving ${
          yagi ? yagi.guilds.cache.size : 'N/A'
        } servers!\n\nMy timer data is extracted from the player-run [Olympus WB Sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/edit#gid=585652389). Kudos to the hardwork of the editors and leads in the team!\n\nFor a detailed list of my commands, type \`/help\``,
        color: 32896,
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
        },
        fields: [
          {
            name: 'Creator',
            value: 'Vexuas#8141',
            inline: true,
          },
          {
            name: 'Date Created',
            value: yagi && yagi.user ? format(yagi.user.createdTimestamp, 'dd-MM-yyyy') : 'N/A',
            inline: true,
          },
          {
            name: 'Version',
            value: BOT_VERSION,
            inline: true,
          },
          {
            name: 'Library',
            value: 'discord.js',
            inline: true,
          },
          {
            name: 'Last Update',
            value: '05-March-2023',
            inline: true,
          },
          {
            name: 'Support Server',
            value: '[Come join!](https://discord.gg/7nAYYDm)',
            inline: true,
          },
        ],
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
} as AppCommand;
