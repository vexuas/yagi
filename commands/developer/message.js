const guildConfig = require('../../config/guild.json');
const { defaultPrefix } = require('../../config/yagi.json');
const grvAcnt = '`';
const { format } = require('date-fns');

const generateEmbedUser = function designOfReplyEmbedForUser(message, replyContent) {
  const embed = {
    title: 'Successfully delivered!',
    description: 'Replies are either sent through direct message or the channel it was written in.',
    color: 55296,
    thumbnail: {
      url: message.author.displayAvatarURL
    },
    fields: [
      {
        name: 'Your Message:',
        value: replyContent
      }
    ]
  };
  return embed;
};
const sendEmbedDev = function designOfReplyEmbedForDevAndSendToServer(message, replyContent, yagi) {
  let currentPrefix, channelName, channelID, guildName, guildID;

  if (message.channel.type === 'dm' || message.channel.type === 'group') {
    currentPrefix = defaultPrefix;
    (channelName = 'Sent in a DM'), (guildName = 'Sent in a DM');
    guildID = '-';
  } else {
    currentPrefix = guildConfig[message.guild.id].prefix;
    channelName = message.channel.name;
    guildName = message.guild.name;
    guildID = message.guild.id;
  }
  const embed = {
    title: 'New Message Received!',
    description: `To reply: ${grvAcnt}${currentPrefix} {user/channel/server ID} {yourReply}${grvAcnt}`,
    color: 55296,
    footer: { text: `Sent on ${format(new Date(), 'dddd MMM D YYYY, h:mm:ss A')}` },
    thumbnail: {
      url: message.author.displayAvatarURL
    },
    fields: [
      {
        name: 'Name',
        value: message.author.tag,
        inline: true
      },
      {
        name: 'User ID',
        value: message.author.id,
        inline: true
      },
      {
        name: 'Channel',
        value: channelName,
        inline: true
      },
      {
        name: 'Channel ID',
        value: message.channel.id,
        inline: true
      },
      {
        name: 'Server',
        value: guildName,
        inline: true
      },
      {
        name: 'Server ID',
        value: guildID,
        inline: true
      },
      {
        name: 'Message',
        value: '```yaml\n' + replyContent + '```'
      }
    ]
  };
  const messageServer = yagi.channels.get('615640139678351557');

  return messageServer.send({ embed });
};

module.exports = {
  name: 'message',
  description:
    'Sends a message to the owner of the bot! Anything typed after the command is treated as your message.',
  hasArguments: true,
  exampleArgument: 'Hi there!',
  execute(message, arguments, yagi) {
    const embed = generateEmbedUser(message, arguments);
    message.channel.send({ embed });
    sendEmbedDev(message, arguments, yagi);
  }
};
