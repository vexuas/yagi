import { CacheType, Interaction } from 'discord.js';
import { sendMixpanelEvent } from '../../services/analytics';
import { EventModule } from '../events';

export default function ({ yagi, appCommands, mixpanel }: EventModule) {
  yagi.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
    if (!interaction.inGuild()) return; //Only respond in server channels or if it's an actual command

    if (interaction.isCommand()) {
      const { commandName } = interaction;
      await appCommands[commandName].execute({ interaction, yagi });
      mixpanel &&
        interaction.channel &&
        interaction.guild &&
        sendMixpanelEvent({
          user: interaction.user,
          channel: interaction.channel,
          guild: interaction.guild,
          command: commandName,
          client: mixpanel,
        }); //Send tracking event to mixpanel
    }
  });
}
