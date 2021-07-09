const { insertNewReminder, disableReminder } = require('../../database/reminder-db');

const reminderInstructions = () => {
  const embed ={
    "description": "Personal reminder to notify you when world boss is spawning soon.\nCan only be activated in one channel per server by an admin.\n\n",
    "color": 32896,
    thumbnail: {
      url:
        'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
    },
    "fields": [
      {
        "name": "How to enable:",
        "value": "1. In the channel you want to get notifications from, type `$yagi-remind enable`. This will activate reminders on the current channel.\n2. When a channel is successfully activated, a special message is sent to the channel with details about the reminder."
      },
      {
        "name": "How to use",
        "value": "1. When a channel is activated, Yagi creates a new role in the server `@Goat Hunters`\n2. To get reminders, simply react on the special message with :goat: and you will automatically get the role. *Note that by removing the reaction you will lose the role*\n3. When world boss is spawning soon, Yagi will ping the role\n\n*To get the special message again, type `$yagi-remind`. You can also edit the role to customise its name/color*"
      },
      {
        "name": "How to disable",
        "value": "1. Type `$yagi-remind disable` in the channel where reminders was enabled. This will deactivate reminders on the current channel.\n2. When a channel is succesfully deactivated, the `@Goat Hunters` role will be deleted"
      }
    ]
  }
  return embed;
}

module.exports = {
  name: 'remind',
  description : 'Activates a reminder inside a channel that pings users when world boss is spawning soon',
  hasArguments: true,
  execute(message, arguments, yagi, commands, yagiPrefix){
    if(arguments){
      switch (arguments) {
        case 'enable':
          insertNewReminder(message);
          return message.channel.send('Reminder enabled!');
        case 'disable':
          disableReminder(message);
          return message.channel.send('Reminder disabled!');
        default:
          return message.channel.send('Only accepts `enable` or `disable` as arguments');
      }
    } else {
      const embed = reminderInstructions();
      message.channel.send({ embed });
    }
  }
}
