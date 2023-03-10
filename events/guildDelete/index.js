const { deleteGuild } = require('../../services/database');
const { sendErrorLog } = require('../../utils/helpers');

/**
 * Event handlers for when yagi is kickined from a server
 * Deletes guild record in our database and sends notification to channel in Yagi's Den
 */
module.exports = ({ yagi }) => {
  yagi.on('guildDelete', async (guild) => {
    try {
      await deleteGuild(guild, yagi);
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
};
