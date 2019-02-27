const embed = {
  color: 32896,
  footer: {
    text:
      "Messages are sent when countdowns are at 60 minutes and 10 minutes before upcoming spawns"
  },
  fields: [
    {
      name: "User",
      value:
        "• Bot will make reminders through direct messages\n• To activate, type `+remindme` followed by a command\n• To deactivate, type `+remindme!` followed by the command\n• To view active reminders, type `+remindme list`\n• To clear all user reminders, type `+remindme stop`\n• Example: `+remindme goatsc` | `+remindme! goatsc`"
    },
    {
      name: "Channel",
      value:
        "• Bot will make reminders through the channel it was activated in\n• Can only be used by members with Administrative permissions\n• To activate, type `+remindhere` followed by a command\n• To deactivate, type `+remindhere!` followed by the command\n• To view active reminders, type `+remindhere list`\n• To clear all channel reminders, type `+remindhere stop`\n• Example: `+remindhere goatsp` | `+remindhere! goatsp`"
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
