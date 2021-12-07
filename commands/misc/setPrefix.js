//Reminder to add custom prefix before v3
const { defaultPrefix } = require('../../config/yagi.json');
const { codeBlock } = require('../../helpers');

const generateErrorEmbed = (type, prefix) => {
  let embed = {
    color: 16711680,
    title: 'Whoops!',
    description: '',
    fields: [
      {
        name: 'Example',
        value: '```fix\n\n' + `${prefix}setprefix` +' `newPrefix`\n' + '```'
      }
    ]
  }
  switch(type){
    case 'empty':
     embed.description = 'New prefix cannot be empty!';
    break;
    case 'incorrect':
      embed.description = 'To set a new prefix, make sure to add your new prefix between ``';
    break;
    case 'admin': 
      embed.description = 'Only users with Admin privileges can set a new custom prefix';
      embed.fields = undefined;
    break;
  }
  return embed;
}
module.exports = {
  name: 'setprefix',
  description: `Sets yagi's prefix to a custom one`,
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix) {
    if(!arguments){
      return message.channel.send('help embed go here');
    }
    if(!message.member.hasPermission("ADMINISTRATOR")){
      const embed = generateErrorEmbed('admin', yagiPrefix);
      return message.channel.send({ embed });
    }
    if(arguments.startsWith("`") && arguments.endsWith("`") && arguments.length >= 2){
      if(arguments.length === 2){
        const embed = generateErrorEmbed('empty', yagiPrefix);
        return message.channel.send({ embed });
      }
      if(arguments.length > 2){
        const newPrefix = arguments.replace(/\`/g, '');
        return message.channel.send('New prefix successfully set!' + ` ${codeBlock(newPrefix)}`);
      }
    } else {
      const embed = generateErrorEmbed('incorrect', yagiPrefix);
      return message.channel.send({ embed })
    }
  }
};
