const embed = {
  description: null,
  color: 32896
};

module.exports = {
  name: 'website',
  description: 'website link',
  execute(message) {
    embed.description = `${
      message.author
    } | [Come visit my website! (◕ᴗ◕✿)](https://ak-goats.com/)`;
    message.channel.send({ embed });
  }
};
