const fs = require('fs');
const { chimchannellist, chimchannelid } = require('./chimchannels.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindhere goatsc',
  description: 'channel enable reminder function',
  execute(message, args) {
    if (message.channel.type !== 'text') {
      return message.author.send(
        'Channel reminders can only be used in a server channel by an administrator'
      );
    } else if (message.member.hasPermission('ADMINISTRATOR')) {
      let servername = message.channel.guild.name;
      let channelname = message.channel.name;
      let fullname = `${servername}-${channelname}`;
      console.log(fullname);
      let channelid = message.channel.id;
      console.log(channelid);
      if (chimchannellist[fullname] === 'enable') {
        return message.channel.send('Channel reminder is already enabled');
      } else {
        reminders.addChimChannel(fullname);
        message.channel.send('Channel reminder enabled!');
        chimchannellist[fullname] = 'enable';
        chimchannelid[fullname] = channelid; //Setting userID to send message later
        const channelkeys = Object.keys(chimchannellist);
        const channelvalues = Object.values(chimchannellist);
        const channelidkeys = Object.keys(chimchannelid);
        const channelidvalues = Object.values(chimchannelid);
        let channelidobject = [];
        let channelobject = [];
        for (let i = 0; i < channelkeys.length; i++) {
          channelobject.push(` "${channelkeys[i]}" : "${channelvalues[i]}"`);
        }
        for (let i = 0; i < channelidkeys.length; i++) {
          channelidobject.push(
            ` "${channelidkeys[i]}" : "${channelidvalues[i]}"`
          );
        }
        fs.writeFile(
          './commands/chimchannels.js',
          `let chimchannellist = {${channelobject}}\nlet chimchannelid = {${channelidobject}}\n\nmodule.exports = {\n  chimchannellist: chimchannellist, chimchannelid: chimchannelid\n}`,
          function(err) {
            if (err) {
              return console.log(err);
            }
            console.log('The file was saved!');
          }
        );
      }
      console.log(chimchannellist);
    } else {
      message.channel.send(
        'You need administrative rights to use this command'
      );
    }
  }
};
