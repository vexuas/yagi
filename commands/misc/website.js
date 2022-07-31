const embed = {
  description: null,
  color: 32896,
};

module.exports = {
  name: 'website',
  description: 'Generates a link to the website version of Yagi (outdated)',
  execute(message) {
    embed.description = `${message.author} | [Come visit my website! (◕ᴗ◕✿)](https://ak-goats.com/)`;
    message.channel.send({ embeds: [embed] });
  },
};
