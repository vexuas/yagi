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
      currentUser.send(replyContent);
    } else {
      return;
    }
  }
};
