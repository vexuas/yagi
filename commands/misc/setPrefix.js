//Reminder to add custom prefix before v3
const { defaultPrefix } = require('../../config/yagi.json');
const { codeBlock } = require('../../helpers');

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
  name: 'setprefix',
  description: `Sets yagi's prefix to a custom one`,
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix) {
    const currentPrefix = defaultPrefix;
    
    if(!arguments){
      return message.channel.send('help embed go here');
    }
    if(arguments.startsWith("`") && arguments.endsWith("`") && arguments.length >= 2){
      if(arguments.length === 2){
        return message.channel.send('New prefix cannot be empty');
      }
      if(arguments.length > 2){
        const newPrefix = arguments.replace(/\`/g, '');
        return message.channel.send('New prefix successfully set!' + ` ${codeBlock(newPrefix)}`);
      }
    } else {
      return message.channel.send('To set a new prefix, make sure to add your new prefix between ``')
    }
  }
};
