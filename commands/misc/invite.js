const embed = {
  description: null,
  color: 32896
};

module.exports = {
  name: 'invite',
  description: 'Generates an invite link for Yagi',
  execute(message) {
    embed.description = `${
      message.author
    } | [Add me to your servers! (◕ᴗ◕✿)](https://tinyurl.com/yagi-invite)`;
    message.channel.send({ embed });
  }
};
