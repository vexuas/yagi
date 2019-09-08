const embed = {
  color: 32896,
  footer: {
    text: 'Kudos to all the leads and editors for being awesome and making all this possible!'
  },
  fields: [
    {
      name: 'Phoenix',
      value:
        '• [Lazy Goat](https://tinyurl.com/LazyGoatWB)\n• [Angels](https://docs.google.com/spreadsheets/d/1MrMwNerILxNK0lvKCBklkYZx_OKAb4io8XdaldRyO_g/edit#gid=1305398803)',
      inline: true
    },
    {
      name: 'Chimera',
      value: '• [Catalyst](https://tinyurl.com/catalyst-ak)',
      inline: true
    }
  ]
};

module.exports = {
  name: 'sheets',
  description:
    'A collection of current and previous sheets used by leads/editors to keep track of World Boss',
  execute(message) {
    embed.description = `${message.author} | Public Sheets`;
    message.channel.send({ embed });
  }
};
