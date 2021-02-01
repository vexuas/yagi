const { currentOffset, dstOffset, normalOffset, start, end } = require('../../config/offset.json');

const embed = {
  title: 'Offset Changed!',
  color: 32896,
  fields: [
    {
      name: 'Current Offset',
      value: currentOffset
    }
  ]
};

module.exports = {
  name: 'offset',
  description: "Switches offset between normal and dst",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return message.channel.send({ embed });
    }
    return;
  }
};
