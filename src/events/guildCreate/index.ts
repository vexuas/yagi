import { Guild, WebhookClient } from 'discord.js';
import { isEmpty } from 'lodash';
import { GUILD_NOTIFICATION_WEBHOOK_URL } from '../../config/environment';
import { insertNewGuild } from '../../services/database';
import { sendErrorLog, serverEmbed } from '../../utils/helpers';
import { EventModule } from '../events';

/**
 * Event handlers for when yagi is invited to a new server
 * Creates a guild record in our database and sends notification to channel in Yagi's Den
 */
export default function ({ yagi }: EventModule) {
  yagi.on('guildCreate', async (guild: Guild) => {
    try {
      await insertNewGuild(guild);
      if (GUILD_NOTIFICATION_WEBHOOK_URL && !isEmpty(GUILD_NOTIFICATION_WEBHOOK_URL)) {
        const embed = await serverEmbed(yagi, guild, 'join');
        const notificationWebhook = new WebhookClient({ url: GUILD_NOTIFICATION_WEBHOOK_URL });
        await notificationWebhook.send({
          embeds: [embed],
          username: 'Yagi Server Notificaiton',
          avatarURL:
            'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
        });
      }
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
}
