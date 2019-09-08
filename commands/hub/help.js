const { descriptionEmbed } = require('../../helpers');

module.exports = {
  name: 'help',
  description: 'directory hub of commands',
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix) {
    if (arguments.length === 0) {
      return message.channel.send('hi'); //all commands
    }
    try {
      if (!commands[arguments].devOnly) {
        const embed = descriptionEmbed(
          arguments,
          commands[arguments].description,
          yagiPrefix,
          commands[arguments].hasArguments,
          commands[arguments].exampleArgument
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
