import { CacheType, Client, Interaction } from 'discord.js';
import { Mixpanel } from 'mixpanel';
import { sendMixpanelEvent } from '../../services/analytics';

interface Props {
  yagi: Client;
  appCommands: any;
  mixpanel: Mixpanel;
}
export default function ({ yagi, appCommands, mixpanel }: Props) {
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
