const generateEmbed = function designOfReplyEmbed(message, replyContent) {
  const embed = {
    title: 'Successfully delivered!',
    description:
      'Replies are sent through direct message so make sure you allow DMs from server members!',
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

module.exports = {
  name: 'reply',
  description: "reply to a user's message",
  hasArguments: true,
  execute(message, arguments, yagi) {
    //Only responds to my id
    if (message.author.id === '183444648360935424') {
      const userID = arguments.split(' ', 1).toString(); //Gets ID of user who used command
      const replyContent = arguments.slice(userID.length + 1); //What to send to user
      const currentUser = yagi.users.get(userID);
      const embed = generateEmbed(message, replyContent);
      currentUser.send({ embed });
    } else {
      return;
    }
  }
};
