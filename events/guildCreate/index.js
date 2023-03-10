const { insertNewGuild } = require('../../services/database');
const { sendErrorLog } = require('../../utils/helpers');

/**
 * Event handlers for when yagi is invited to a new server
 * Creates a guild record in our database and sends notification to channel in Yagi's Den
 */
module.exports = ({ yagi }) => {
  yagi.on('guildCreate', async (guild) => {
    try {
      await insertNewGuild(guild, yagi);
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
};
