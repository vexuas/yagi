const fs = require("fs");
const { userlist } = require("./users.js");

module.exports = {
  name: "remindme goatsc",
  description: "user enable reminder function",
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    if (userlist[username] === 1) {
      return message.channel.send("User reminder already enabled");
    } else {
      message.channel.send("User reminder enabled!");
      userlist[username] = 1;
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
