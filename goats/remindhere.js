module.exports = {
  name: "remindhere",
  description: "user reminder",
  execute(message, args) {
    message.channel.send("To set a channel reminder: `+remindhere command`");
  }
};
