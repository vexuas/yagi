import { AppCommand, AppCommandOptions } from '../commands';
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types/v9';

export const generateHelpEmbed = (): APIEmbed => {
  const embed = {
    color: 32896,
    description: 'Below you can see all the commands that I know!',
    fields: [
      {
        name: 'Timer',
        value: '`goats`, `remind`',
        inline: false,
      },
      {
        name: 'Information',
        value: '`about`, `help`, `loot`, `invite`, `sheets`',
        inline: false,
      },
    ],
  };
  return embed;
};
export default {
  data: new SlashCommandBuilder().setName('help').setDescription('Directory hub of commands'),
  async execute({ interaction }: AppCommandOptions) {
    try {
      const embed = generateHelpEmbed();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
} as AppCommand;
