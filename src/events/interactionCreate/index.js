const { sendMixpanelEvent } = require('../../services/analytics');

module.exports = ({ yagi, appCommands, mixpanel }) => {
  yagi.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild()) return; //Only respond in server channels or if it's an actual command

    if (interaction.isCommand()) {
      const { commandName } = interaction;
      await appCommands[commandName].execute({ interaction, yagi });
      mixpanel &&
        sendMixpanelEvent({
          user: interaction.user,
          channel: interaction.channel,
          guild: interaction.guild,
          command: commandName,
          client: mixpanel,
        }); //Send tracking event to mixpanel
    }
  });
};
