import { AppCommand, AppCommandOptions } from '../commands';
import { SlashCommandBuilder } from '@discordjs/builders';

//TODO: Rename this to status
//TODO: Refactor remind functionality
export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Displays information on setting up automatic goat updates'),
  async execute({ interaction }: AppCommandOptions) {
    try {
      const embed = {
        title: 'Reminder',
        color: 32896,
        description:
          'Temporary disabling the `remind` command for now as a newer and better version of it is currently being developed.\n\nIf you had this feature enabled before, feel free to delete the reminder channel and role. Sorry for the inconvenience!',
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
} as AppCommand;
