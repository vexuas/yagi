const fs = require("fs");
const { userlist } = require("./users.js");

module.exports = {
  name: "remindme! goatsc",
  description: "user disable reminder function",
  execute(message, args) {
    //Updating user files to indicate disabled
    let username = message.author.username;
    if (userlist[username] === 0) {
      return message.channel.send("User reminder is already disabled");
    } else {
      message.channel.send("User reminder disabled!");
      userlist[username] = 0;
      const userkeys = Object.keys(userlist);
      const uservalues = Object.values(userlist);
      let userobject = [];
      for (let i = 0; i < userkeys.length; i++) {
        userobject.push(` ${userkeys[i]} : ${uservalues[i]}`);
      }
      fs.writeFile(
        "./goats/users.js",
        `let userlist = {${userobject}}\n\nmodule.exports = {\n  userlist: userlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
    }
    console.log(userlist);
  }
};
