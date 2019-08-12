const fs = require('fs');
const { chimuserlist, chimidlist } = require('./chimusers.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindme! goatsc',
  description: 'user disable reminder function',
  execute(message, args) {
    //Updating user files to indicate disabled
    let username = message.author.username;
    if (chimuserlist[username] === 'disable') {
      return message.channel.send('User reminder is already disabled');
    } else {
      reminders.removeChimUser(username);
      message.channel.send('User reminder disabled!');
      chimuserlist[username] = 'disable';
      delete chimidlist[username];
      const userkeys = Object.keys(chimuserlist);
      const uservalues = Object.values(chimuserlist);
      const idkeys = Object.keys(chimidlist);
      const idvalues = Object.values(chimidlist);
      let idobject = [];
      let userobject = [];
      for (let i = 0; i < userkeys.length; i++) {
        userobject.push(` ${userkeys[i]} : "${uservalues[i]}"`);
      }
      for (let i = 0; i < idkeys.length; i++) {
        idobject.push(` ${idkeys[i]} : "${idvalues[i]}"`);
      }
      fs.writeFile(
        './commands/chimusers.js',
        `let chimuserlist = {${userobject}}\nlet chimidlist = {${idobject}}\n\nmodule.exports = {\n  chimuserlist: chimuserlist,\nchimidlist: chimidlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('The file was saved!');
        }
      );
    }
    console.log(chimuserlist);
  }
};
