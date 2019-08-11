const fs = require('fs');
const { phoechannellist, phoechannelid } = require('./phoechannels.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindhere! goatsp',
  description: 'channel enable reminder function',
  execute(message, args) {
    //Updating user files to indicate enabled
    let servername = message.channel.guild.name;
    let channelname = message.channel.name;
    let fullname = `${servername}-${channelname}`;
    console.log(fullname);
    let channelid = message.channel.id;
    console.log(channelid);
    if (phoechannellist[fullname] === 'disable') {
      return message.channel.send('Channel reminder is already disabled');
    } else {
      reminders.removePhoeChannel(fullname);
      message.channel.send('Channel reminder disabled!');
      phoechannellist[fullname] = 'disable';
      delete phoechannelid[fullname];
      const channelkeys = Object.keys(phoechannellist);
      const channelvalues = Object.values(phoechannellist);
      const channelidkeys = Object.keys(phoechannelid);
      const channelidvalues = Object.values(phoechannelid);
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
        './commands/phoechannels.js',
        `let phoechannellist = {${channelobject}}\nlet phoechannelid = {${channelidobject}}\n\nmodule.exports = {\n  phoechannellist: phoechannellist, phoechannelid: phoechannelid\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('The file was saved!');
        }
      );
    }
    console.log(phoechannellist);
  }
};
