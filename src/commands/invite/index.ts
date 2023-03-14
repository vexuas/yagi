import { AppCommand, AppCommandOptions } from '../commands';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generates an invite link for Yagi'),
  async execute({ interaction }: AppCommandOptions) {
    try {
      const embed = {
        description: `<@${interaction.user.id}> | [Add me to your servers! (◕ᴗ◕✿)](https://discord.com/api/oauth2/authorize?client_id=518196430104428579&permissions=805309456&scope=bot)`,
        color: 32896,
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
} as AppCommand;
