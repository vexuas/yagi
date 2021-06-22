//Reminder to add custom prefix before v3
const { defaultPrefix } = require('../../config/yagi.json');

const generateEmbed = function designOfPrefixEmbed(currentPrefix) {
  const embed = {
    color: 32896,
    fields: [
      {
        name: 'Current Prefix',
        value: currentPrefix,
        inline: true
      },
      {
        name: 'Usage Example',
        value: `${currentPrefix}help`,
        inline: true
      }
    ]
  };
  return embed;
};

module.exports = {
  name: 'prefix',
  description: 'Shows current prefix',
  hasArguments: false,
  execute(message) {
    const currentPrefix = defaultPrefix;
    const embed = generateEmbed(currentPrefix);
    message.channel.send({ embed });
  }
};
