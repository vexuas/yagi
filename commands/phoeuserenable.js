const fs = require('fs');
const { phoeuserlist, phoeidlist } = require('./phoeusers.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindme goatsp',
  description: 'user enable reminder function',
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    let userid = message.author.id;
    if (phoeuserlist[username] === 'enable') {
      return message.channel.send('User reminder is already enabled');
    } else {
      reminders.addPhoeUser(username, userid);
      message.channel.send('User reminder enabled!');
      phoeuserlist[username] = 'enable';
      phoeidlist[username] = userid; //Setting userID to send message later
      const userkeys = Object.keys(phoeuserlist);
      const uservalues = Object.values(phoeuserlist);
      const idkeys = Object.keys(phoeidlist);
      const idvalues = Object.values(phoeidlist);
      let idobject = [];
      let userobject = [];
      for (let i = 0; i < userkeys.length; i++) {
        userobject.push(` ${userkeys[i]} : "${uservalues[i]}"`);
      }
      for (let i = 0; i < idkeys.length; i++) {
        idobject.push(` ${idkeys[i]} : "${idvalues[i]}"`);
      }
      fs.writeFile(
        './commands/phoeusers.js',
        `let phoeuserlist = {${userobject}}\nlet phoeidlist = {${idobject}}\n\nmodule.exports = {\n  phoeuserlist: phoeuserlist, phoeidlist: phoeidlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('The file was saved!');
        }
      );
    }
    console.log(phoeuserlist);
  }
};
