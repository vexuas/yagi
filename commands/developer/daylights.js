const { currentOffset, dstOffset, normalOffset, start, end } = require('../../config/offset.json');

const embed = {
  description: 'Daylight Savings Information',
  color: 32896,
  thumbnail: {
    url:
      'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
  },
  fields: [
    {
      name: 'Usage',
      value: 'When Daylights is active. switch offset to the DST offset and to the normal offset when clocks are switched back.'
    },
    {
      name: 'Current Offset',
      value: currentOffset,
      inline: true
    },
    {
      name: 'Normal Offset',
      value: normalOffset,
      inline: true
    },
    {
      name: 'DST Offset',
      value: dstOffset,
      inline: true
    },
    {
      name: 'Start Date',
      value: start,
      inline: true
    },
    {
      name: 'End Date',
      value: end,
      inline: true
    },
  ]
};

module.exports = {
  name: 'daylights',
  description: "Shows current offset and daylight savings time start and end dates",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return message.channel.send({ embed });
    }
    return;
  }
};
