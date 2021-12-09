const { descriptionEmbed } = require('../../helpers');

module.exports = {
  name: 'help',
  description: 'directory hub of commands',
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix) {
    if (arguments.length === 0) {
      //all commands
      const embed = {
        color: 32896,
        description:
          'Below you can see all the commands that I know!\n\nMy current prefix is `' +
          yagiPrefix +
          '`',
        fields: [
          {
            name: 'Timer',
            value: '`goats`, `remind`'
          },
          {
            name: 'Information',
            value: '`info`, `help`, `prefix`, `invite`, `sheets`, `release`'
          },
          {
            name: 'Miscellaneous',
            value:
              '`loot`, `contacts`, `website`, `feedback`\n\nFor more detailed information about a command, use `' +
              yagiPrefix +
              'help <Command>`'
          }
        ]
      };
      return message.channel.send({ embed });
    }
    try {
      if (!commands[arguments].devOnly) {
        const embed = descriptionEmbed(
          arguments,
          commands[arguments].description,
          yagiPrefix,
          commands[arguments].hasArguments,
        );
        return message.channel.send({ embed });
      } else {
        return message.channel.send('That command is only for devs to use! （・□・；）');
      }
    } catch (e) {
      const argsArray = arguments.split(' ');

      if (argsArray.length === 1) {
        return message.channel.send("That command doesn't exist! （・□・；）");
      } else {
        return message.channel.send('This command only accepts one argument! （・□・；）');
      }
    }
  }
};
