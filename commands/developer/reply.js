const { format } = require('date-fns');

const sendReplyEmbedUser = function designOfReplyEmbedAndSendToUser(
  message,
  replyContent,
  platform
) {
  const embed = {
    title: 'New message!',
    description: `You've got a reply from ${message.author.tag}!`,
    footer: { text: `Sent on ${format(new Date(), 'dddd MMM D YYYY, h:mm:ss A')}` },
    color: 16776960,
    thumbnail: {
      url: message.author.displayAvatarURL
    },
    fields: [
      {
        name: 'Message',
        value: '```yaml\n' + replyContent + '```'
      }
    ]
  };
  return platform.send({ embed });
};

module.exports = {
  name: 'reply',
  description: "reply to a user's message",
  hasArguments: true,
  execute(message, arguments, yagi) {
    //Only responds to my id
    if (message.author.id === '183444648360935424') {
      const platform = arguments.split(' ', 1).toString(); //Whether or not it's in channel or dm
      //Gets either ID of user who used command or the channel it was used in
      const platformID = arguments
        .slice(platform.length + 1)
        .split(' ', 1)
        .toString();
      const replyContent = arguments.slice(platform.length + platformID.length + 2); //What to send to user
      switch (platform) {
        case 'channel':
          const channelID = yagi.channels.get(platformID);
          sendReplyEmbedUser(message, replyContent, channelID);
          break;
        case 'user':
          const userID = yagi.users.get(platformID);
          sendReplyEmbedUser(message, replyContent, userID);
          break;
        default:
          return message.channel.send('Please specify which platform to send reply!');
      }
    } else {
      return;
    }
  }
};
