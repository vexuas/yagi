const { getApplicationCommands } = require('../commands');
const { sendErrorLog } = require('../utils/helpers');
const { sendMixpanelEvent } = require('../services/analytics');
const anything = require('./ready');
const anythingTwo = require('./guildCreate');
const anythingThree = require('./guildDelete');
const anythingFour = require('./messageCreate');

const appCommands = getApplicationCommands();

exports.registerEventHandlers = ({ yagi, mixpanel }) => {
  anything(yagi, appCommands);
  anythingTwo(yagi);
  anythingThree(yagi);
  anythingFour(yagi);
  //------
  yagi.on('error', (error) => {
    sendErrorLog(yagi, error);
  });
  yagi.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild()) return; //Only respond in server channels or if it's an actual command

    if (interaction.isCommand()) {
      const { commandName } = interaction;
      await appCommands[commandName].execute({ interaction, yagi });
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
