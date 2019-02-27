module.exports = {
  name: "remindhere",
  description: "user reminder",
  execute(message, args) {
    if (message.channel.type !== "text") {
      return message.author.send(
        "Channel reminders can only be used in a server channel by an administrator"
      );
    } else if (message.member.hasPermission("ADMINISTRATOR")) {
      return message.channel.send(
        "To set a channel reminder: `+remindhere command`"
      );
    } else {
      message.channel.send(
        "You need administrative rights to use this command"
      );
    }
  }
};
