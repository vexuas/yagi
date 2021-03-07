module.exports = {
  name: "psa",
  description: "Toggles a trigger that sends a public service announcement when using the timer. Only to be used in extreme cases where timer data is experiencing problems",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return message.channel.send({ embed });
    }
    return;
  }
};
