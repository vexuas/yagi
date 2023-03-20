import { AppCommand, AppCommandOptions } from '../commands';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  getServerTime,
  formatLocation,
  getWorldBossData,
  validateWorldBossData,
  sendErrorLog,
} from '../../utils/helpers';
import { format } from 'date-fns';
import { MessageEmbed } from 'discord.js';

export type WorldBossData = {
  location: string;
  lastSpawn: string;
  nextSpawn: string;
  countdown: string;
};
export interface ValidWorldBossData extends WorldBossData {
  serverTime: string;
  accurate: boolean;
  projectedNextSpawn: string;
}
type WorldBossTimerEmbed = {
  title: string;
  description: string;
  color: number;
  thumbnail: {
    url: string;
  };
  fields: { name: string; value: string; inline?: boolean }[];
  footer: {
    text: string;
  };
};

const generateEmbed = (worldBossData: ValidWorldBossData): WorldBossTimerEmbed => {
  const serverTimeDesc = `Server Time: \`${format(
    new Date(worldBossData.serverTime),
    'eeee, h:mm:ss a'
  )}\``;
  const spawnDate = new Date(worldBossData.nextSpawn);
  const spawnDesc = `Spawn: \`${worldBossData.location.toLowerCase()}, ${format(
    spawnDate,
    'h:mm:ss a'
  )}\``;
  const spawnFooter = worldBossData.accurate
    ? ''
    : `**Note that sheet data isn't up to date, timer accuracy might be off`;

  const embedData = {
    title: 'Olympus | World Boss',
    description: `${serverTimeDesc}\n${spawnDesc}`,
    color: 32896,
    thumbnail: {
      url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
    },
    footer: {
      text: spawnFooter,
    },
    fields: [
      {
        name: 'Location',
        value: '```fix\n\n' + formatLocation(worldBossData.location) + '```',
      },
      {
        name: 'Countdown',
        value: '```xl\n\n' + worldBossData.countdown + '```',
        inline: true,
      },
      {
        name: 'Time of Spawn',
        value: '```xl\n\n' + format(spawnDate, 'h:mm:ss a') + '```',
        inline: true,
      },
    ],
  };
  return embedData;
};

export default {
  data: new SlashCommandBuilder()
    .setName('goats')
    .setDescription(`Shows current timer for Vulture's Vale and Blizzard Berg World Boss`),
  async execute({ yagi, interaction }: AppCommandOptions) {
    try {
      await interaction.deferReply();
      const serverTime = getServerTime();
      const worldBossData = await getWorldBossData();
      const validatedWorldBossData = validateWorldBossData(worldBossData, serverTime);
      const embed = validatedWorldBossData && generateEmbed(validatedWorldBossData);
      await interaction.editReply({ embeds: [embed as MessageEmbed] });
    } catch (error) {
      yagi && sendErrorLog(yagi, error as Error);
    }
  },
} as AppCommand;
