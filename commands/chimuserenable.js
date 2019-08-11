const fs = require('fs');
const { chimuserlist, chimidlist } = require('./chimusers.js');
const reminders = require('../yagi');

module.exports = {
  name: 'remindme goatsc',
  description: 'user enable reminder function',
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    let userid = message.author.id;
    if (chimuserlist[username] === 'enable') {
      return message.channel.send('User reminder is already enabled');
    } else {
      reminders.addChimUser(username, userid);
      message.channel.send('User reminder enabled!');
      chimuserlist[username] = 'enable';
      chimidlist[username] = userid; //Setting userID to send message later
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
        `let chimuserlist = {${userobject}}\nlet chimidlist = {${idobject}}\n\nmodule.exports = {\n  chimuserlist: chimuserlist, chimidlist: chimidlist\n}`,
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
