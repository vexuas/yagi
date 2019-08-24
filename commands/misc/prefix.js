const guildConfig = require('../../config/guild.json');
const fs = require('fs');
const grvAcnt = '`';

const generateEmbed = function designOfPrefixEmbed(currentPrefix) {
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
        value: `• This command accepts one argument\n• ${grvAcnt}${currentPrefix} prefix {Argument}${grvAcnt}\n• Argument: ${grvAcnt}"Your custom prefix"${grvAcnt}\n• Wrapping your prefix between double quotes is compulsory\n• Example prefix w/o space: ${grvAcnt}${currentPrefix} prefix "$"${grvAcnt} will then be ${grvAcnt}$help${grvAcnt}\n• Example prefix w/ space: ${grvAcnt}${currentPrefix} prefix "$ "${grvAcnt} will then be ${grvAcnt}$ help${grvAcnt}`
      }
    ]
  };
  return embed;
};

module.exports = {
  name: 'prefix',
  description: 'all things prefixes',
  hasArguments: true,
  execute(message, arguments) {
    const currentPrefix = guildConfig[message.guild.id].prefix;
    /**
     * First logic sends default prefix embed
     * Second sends error if argument supplied is an empty prefix
     * Third sends an error if you're not an admin
     * Fourth does the actual updating of prefix
     * Last just tells the user to wrap argument between double qoutes
     */
    if (arguments.length === 0) {
      const embed = generateEmbed(currentPrefix);
      message.channel.send({ embed });
    } else if (arguments.length <= 2) {
      message.channel.send(`You can't use an empty prefix（・□・；)`);
    } else if (!message.member.hasPermission('ADMINISTRATOR')) {
      message.channel.send('Sorry, only admins can use this command :c');
    } else if (
      arguments.startsWith('"') &&
      arguments.endsWith('"') &&
      arguments.length > 2 &&
      message.member.hasPermission('ADMINISTRATOR')
    ) {
      const newPrefix = arguments.replace(/"/g, '');
      if (newPrefix === currentPrefix) {
        message.channel.send(`Can't update to the same prefix（・□・；)`);
      } else {
        guildConfig[message.guild.id].prefix = newPrefix;
        fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(
          err
        ) {
          if (err) {
            return console.log(err);
          }
        });
        message.channel.send(
          `Prefix updated to **${newPrefix}**\nExample Usage: ${grvAcnt}${newPrefix}help${grvAcnt}`
        );
      }
    } else {
      message.channel.send('Please wrap your custom prefix between `""`');
    }
  }
};
