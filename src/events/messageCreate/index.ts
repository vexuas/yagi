import { EventModule } from '../events';
import { DEFAULT_PREFIX } from '../../config/environment';
import { sendErrorLog } from '../../utils/helpers';
import { Message } from 'discord.js';

/**
 * Event handler for when a message is sent in a channel that yagi is in
 * Keeping this in for now for legacy sake and letting users know we've switched over to application commands
 * TODO: Remove this after a couple of months
 */
export default function ({ yagi }: EventModule) {
  yagi.on('messageCreate', async (message: Message) => {
    const yagiPrefix = DEFAULT_PREFIX;
    if (message.author.bot) return; //Ignore messages made by yagi

    const embed = {
      description: `Yagi no longer supports prefix commands and instead uses Slash Commands now.\nFor example: \`${yagiPrefix}goats\` -> \`/goats\`.\n\nTo see the full list of commands, use \`/help\`\n\nIf you can't see the commands in your server, [reinvite Yagi with this link](https://discord.com/api/oauth2/authorize?client_id=518196430104428579&permissions=805309456&scope=bot) as it needs extra scope and permissions`,
      color: 32896,
    };
    try {
      message.mentions.users.forEach((user) => {
        if (user === yagi.user) {
          return message.channel.send({ embeds: [embed] });
        }
      });
      message.content.startsWith(yagiPrefix) && (await message.channel.send({ embeds: [embed] }));
    } catch (e) {
      sendErrorLog(yagi, e as Error);
    }
  });
}
