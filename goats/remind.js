const embed = {
  description:
    "Reminders |  Activating this function will make the bot automatically send relevant commands after reaching set countdowns",
  color: 32896,
  footer: {
    text:
      "Messages are sent when countdowns are at 60 minutes and 10 minutes before upcoming spawns. \nTo clear all reminders, type +remindstop"
  },
  fields: [
    {
      name: "User",
      value:
        "• Bot will make reminders through direct messages\n• To activate, type `+remindme` followed by a command\n• To deactivate, type `+remindme!` followed by the command\n• To view active reminders, type `+remindme list`\n• Example: `+remindme goatsc` | `+remindme! goatsc`"
    },
    {
      name: "Channel",
      value:
        "• Bot will make reminders through the channel it was activated in\n• To activate, type `+remindhere` followed by a command\n• To deactivate, type `+remindhere!` followed by the command\n• To view activce reminders, type `+remindhere list`\n• Example: `+remindhere goatsp` | `+remindhere! goatsp`"
    }
  ]
};

module.exports = {
  name: "remind",
  description: "reminder help",
  execute(message, args) {
    message.channel.send({ embed });
  }
};
