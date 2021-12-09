const generateEmbed = function designOfPrefixEmbed(currentPrefix) {
  const embed = {
    color: 32896,
    fields: [
      {
        name: 'Current Prefix',
        value: currentPrefix,
        inline: true,
      },
      {
        name: 'Usage Example',
        value: `${currentPrefix}help`,
        inline: true,
      },
    ],
  };
  return embed;
};

module.exports = {
  name: 'prefix',
  description: 'Shows current prefix',
  hasArguments: false,
  execute(message, arguments, yagi, commands, yagiPrefix) {
    const currentPrefix = yagiPrefix;
    const embed = generateEmbed(currentPrefix);
    message.channel.send({ embed });
  },
};
