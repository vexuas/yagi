const { defaultPrefix } = require('../config/yagi.json');
const { getApplicationCommands } = require('../commands');
const { insertNewGuild, deleteGuild } = require('../services/database');
const { sendErrorLog } = require('../utils/helpers');
const { sendMixpanelEvent } = require('../services/analytics');
const anything = require('./ready');

const appCommands = getApplicationCommands();

exports.registerEventHandlers = ({ yagi, mixpanel }) => {
  anything(yagi, appCommands);
  //------
  /**
   * Event handlers for when yagi is invited to a new server, when he is kicked or when the guild he is in is updated
   * Sends notification to channel in Yagi's Den
   * guildCreate - called when yagi is invited to a server
   * guildDelete - called when yagi is kicked from server
   * More information about each function in their relevant database files
   */
  yagi.on('guildCreate', async (guild) => {
    try {
      await insertNewGuild(guild, yagi);
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
  yagi.on('guildDelete', async (guild) => {
    try {
      await deleteGuild(guild, yagi);
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
  //------
  /**
   * Event handler for when a message is sent in a channel that yagi is in
   * Keeping this in for now for legacy sake and letting users know we've switched over to application commands
   * TODO: Remove this after a couple of months
   */
  yagi.on('messageCreate', async (message) => {
    const yagiPrefix = defaultPrefix;
    if (message.author.bot) return; //Ignore messages made by yagi

    const embed = {
      description: `Yagi no longer supports prefix commands and instead uses Slash Commands now.\nFor example: \`${defaultPrefix}goats\` -> \`/goats\`.\n\nTo see the full list of commands, use \`/help\`\n\nIf you can't see the commands in your server, [reinvite Yagi with this link](https://discord.com/api/oauth2/authorize?client_id=518196430104428579&permissions=805309456&scope=bot) as it needs extra scope and permissions`,
      color: 32896,
    };
    try {
      message.mentions.users.forEach((user) => {
        if (user === yagi.user) {
          return message.channel.send({ embeds: [embed] });
        }
      });
      //Ignores messages without a prefix
      if (message.content.startsWith(yagiPrefix)) {
        return message.channel.send({ embeds: [embed] });
      } else {
        return;
      }
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
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
