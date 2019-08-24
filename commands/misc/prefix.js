const guildConfig = require('../../config/guild.json');
const generateEmbed = function designOfPrefixEmbed(currentPrefix) {
  const grvAcnt = '`';
  const embed = {
    color: 32896,
    footer: {
      text: 'Only members with the administrator role can change my prefix'
    },
    fields: [
      {
        name: 'Current Prefix',
        value: currentPrefix,
        inline: true
      },
      {
        name: 'Usage Example',
        value: `${currentPrefix} help`,
        inline: true
      },
      {
        name: 'How to change prefix',
        value: `• This command accepts two arguments\n• ${grvAcnt}${currentPrefix} prefix {1st argument} {2nd argument}${grvAcnt}\n• 1st argument: ${grvAcnt}Your custom prefix${grvAcnt}\n• 2nd argument: ${grvAcnt}Add a space after prefix; accepts true or false${grvAcnt}\n• Example w/o space: ${grvAcnt}${currentPrefix} prefix $ false${grvAcnt} will then be ${grvAcnt}$help${grvAcnt}\n• Example w/ space: ${grvAcnt}${currentPrefix} prefix $ true${grvAcnt} will then be ${grvAcnt}$ help${grvAcnt}`
      }
    ]
  };
  return embed;
};

module.exports = {
  name: 'prefix',
  description: 'all things prefixes',
  hasArguments: true,
  execute(message, args) {
    const currentPrefix = guildConfig[message.guild.id].prefix;

    if (args.length === 0) {
      const embed = generateEmbed(currentPrefix);
      message.channel.send({ embed });
    } else {
      message.channel.send('what');
    }
  }
};
