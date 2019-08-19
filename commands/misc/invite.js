const embed = {
  description: null,
  color: 32896
};

module.exports = {
  name: 'invite',
  description: 'invite link',
  execute(message) {
    embed.description = `${
      message.author
    } | [Add me to your servers! (◕ᴗ◕✿)](https://tinyurl.com/ak-goats-bot)`;
    message.channel.send({ embed });
  }
};
