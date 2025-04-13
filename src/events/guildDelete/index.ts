import { Guild, WebhookClient } from 'discord.js';
import { isEmpty } from 'lodash';
import { GUILD_NOTIFICATION_WEBHOOK_URL } from '../../config/environment';
import { deleteGuild } from '../../services/database';
import { sendErrorLog, serverEmbed } from '../../utils/helpers';
import { EventModule } from '../events';
import { YAGI_AVATAR_URL } from '../../utils/constants';

/**
 * Event handlers for when yagi is kickined from a server
 * Deletes guild record in our database and sends notification to channel in Yagi's Den
 */
export default function ({ yagi }: EventModule) {
  yagi.on('guildDelete', async (guild: Guild) => {
    try {
      await deleteGuild(guild);
      if (GUILD_NOTIFICATION_WEBHOOK_URL && !isEmpty(GUILD_NOTIFICATION_WEBHOOK_URL)) {
        const embed = await serverEmbed(yagi, guild, 'leave');
        const notificationWebhook = new WebhookClient({ url: GUILD_NOTIFICATION_WEBHOOK_URL });
        await notificationWebhook.send({
          embeds: [embed],
          username: 'Yagi Server Notificaiton',
          avatarURL: YAGI_AVATAR_URL,
        });
      }
    } catch (e) {
      sendErrorLog(yagi, e as Error);
    }
  });
}
