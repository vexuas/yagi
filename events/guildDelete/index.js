const { WebhookClient } = require('discord.js');
const { webhooks } = require('../../config/yagi.json');
const { deleteGuild } = require('../../services/database');
const { sendErrorLog, serverEmbed } = require('../../utils/helpers');

/**
 * Event handlers for when yagi is kickined from a server
 * Deletes guild record in our database and sends notification to channel in Yagi's Den
 */
module.exports = ({ yagi }) => {
  yagi.on('guildDelete', async (guild) => {
    try {
      await deleteGuild(guild, yagi);
      const embed = await serverEmbed(yagi, guild, 'leave');
      const notificationWebhook = new WebhookClient({ url: webhooks.guildNotifcation.devURL });
      await notificationWebhook.send({
        embeds: [embed],
        username: 'Yagi Server Notificaiton',
        avatarURL:
          'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
      });
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
};
