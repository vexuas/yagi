const { offset, start, end } = require('../../config/offset.json');

const embed = {
  description: 'Daylight Savings Information',
  color: 32896,
  thumbnail: {
    url:
      'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
  },
  fields: [
    {
      name: 'Current Offset',
      value: offset
    },
    {
      name: 'Start Date',
      value: start
    },
    {
      name: 'End Date',
      value: end
    }
  ]
};

module.exports = {
  name: 'daylights',
  description: "Shows current offset and daylight savings time start and end dates",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      message.channel.send({ embed })
    }
  }
};
