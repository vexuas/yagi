const { deleteGuild } = require('../../services/database');
const { sendErrorLog } = require('../../utils/helpers');

module.exports = (yagi) => {
  yagi.on('guildDelete', async (guild) => {
    try {
      await deleteGuild(guild, yagi);
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
};
