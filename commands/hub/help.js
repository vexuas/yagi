module.exports = {
  name: 'help',
  description: 'directory hub of commands',
  hasArguments: true,
  execute(message, arguments, yagi, commands) {
    if (arguments.length === 0) {
      return message.channel.send('hi'); //all commands
    }
    try {
      return message.channel.send(commands[arguments].description);
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
