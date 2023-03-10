const { defaultPrefix } = require('../../config/yagi.json');
const { sendErrorLog } = require('../../utils/helpers');

/**
 * Event handler for when a message is sent in a channel that yagi is in
 * Keeping this in for now for legacy sake and letting users know we've switched over to application commands
 * TODO: Remove this after a couple of months
 */
module.exports = ({ yagi }) => {
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
};
