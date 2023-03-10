const { insertNewGuild } = require('../../services/database');
const { sendErrorLog } = require('../../utils/helpers');

module.exports = (yagi) => {
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
};
