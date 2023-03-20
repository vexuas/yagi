import { AppCommand, AppCommandOptions } from '../commands';
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types/v9';

export const generateInviteEmbed = (): APIEmbed => {
  const embed = {
    description: `[Add me to your servers! (◕ᴗ◕✿)](https://discord.com/api/oauth2/authorize?client_id=518196430104428579&permissions=805309456&scope=bot)`,
    color: 32896,
  };
  return embed;
};

export default {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generates an invite link for Yagi'),
  async execute({ interaction }: AppCommandOptions) {
    try {
      const embed = generateInviteEmbed();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
} as AppCommand;
