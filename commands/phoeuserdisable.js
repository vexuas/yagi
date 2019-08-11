const fs = require('fs');
const { phoeuserlist, phoeidlist } = require('./phoeusers.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindme! goatsp',
  description: 'user disable reminder function',
  execute(message, args) {
    //Updating user files to indicate disabled
    let username = message.author.username;
    if (phoeuserlist[username] === 'disable') {
      return message.channel.send('User reminder is already disabled');
    } else {
      reminders.removePhoeUser(username);
      message.channel.send('User reminder disabled!');
      phoeuserlist[username] = 'disable';
      delete phoeidlist[username];
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
