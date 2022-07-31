const { currentOffset, dstOffset, normalOffset, start, end } = require('../../config/offset.json');
const fs = require('fs');

const generateEmbed = (offset) => {
  let offsetType;
  if (offset === dstOffset) {
    offsetType = 'In Daylight Savings Time';
  } else if (offset === normalOffset) {
    offsetType = 'In Normal Time';
  }

  const embed = {
    title: 'Offset Changed!',
    color: 32896,
    thumbnail: {
      url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
    },
    fields: [
      {
        name: 'Current Offset',
        value: offset,
      },
      {
        name: 'Timer Information',
        value: offsetType,
      },
    ],
  };
  return embed;
};

/**
 * Simple way to toggle between offsets
 * Checks if currentOffset is one value and sets the new offset to the other
 * Setting the value here isn't enough, we have to update the json file where the timers gets the offset from
 * Since I initially used filesync to write and update files when I started, used it again here for consistency
 * This works nicely but note in the future to research better handle data states
 */
const toggleOffset = (message) => {
  let offset;

  if (currentOffset === dstOffset) {
    offset = normalOffset;
  } else if (currentOffset === normalOffset) {
    offset = dstOffset;
  }

  const updatedOffsetInfo = {
    currentOffset: offset,
    start,
    end,
    dstOffset,
    normalOffset,
  };
  const embed = generateEmbed(offset);

  fs.writeFile('./config/offset.json', JSON.stringify(updatedOffsetInfo, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    return message.channel.send({ embeds: [embed] });
  });
};

module.exports = {
  name: 'offset',
  description: 'Switches offset between normal and dst',
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return toggleOffset(message);
    }
    return;
  },
};
