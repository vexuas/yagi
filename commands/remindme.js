module.exports = {
  name: "remindme",
  description: "user reminder",
  execute(message, args) {
    message.channel.send("To set a user reminder: `+remindme command`");
  }
};
