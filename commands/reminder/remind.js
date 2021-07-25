const { disableReminder, enableReminder, sendReminderInformation } = require('../../database/reminder-db');

module.exports = {
  name: 'remind',
  description : 'Activates a reminder inside a channel that pings users when world boss is spawning soon',
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix){
    /**
     * Accepts 1 argument which can either be 'enable' and 'disable' which fires the relevant functions
     * If no argument is passed, a reminder instruction function is displayed
     * To prevent channel spam and abuse, enabling/disabling reminders can only be used by admins
     * For documentation of functions see reminder-db file
     */
    const isAdmin = message.member.hasPermission("ADMINISTRATOR");
    if(arguments){
      switch (arguments) {
        case 'enable':
          return isAdmin ? enableReminder(message, yagi) : message.channel.send('Reminders can only be enabled by an admin');
        case 'disable':
          return isAdmin ? disableReminder(message, yagi) : message.channel.send('Reminders can only be disabled by an admin');
        default:
          return message.channel.send('Only accepts `enable` or `disable` as arguments');
      }
    } else {
      sendReminderInformation(message, yagi);
    }
  }
}
