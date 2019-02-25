const fs = require("fs");
const { phoeuserlist } = require("./phoeusers.js");

module.exports = {
  name: "remindme goatsp",
  description: "user enable reminder function",
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    if (phoeuserlist[username] === "phoeEnable") {
      return message.channel.send("User reminder is already enabled");
    } else {
      message.channel.send("User reminder enabled!");
      phoeuserlist[username] = "phoeEnable";
      const userkeys = Object.keys(phoeuserlist);
      const uservalues = Object.values(phoeuserlist);
      let userobject = [];
      for (let i = 0; i < userkeys.length; i++) {
        userobject.push(` ${userkeys[i]} : "${uservalues[i]}"`);
      }
      fs.writeFile(
        "./goats/phoeusers.js",
        `let phoeuserlist = {${userobject}}\n\nmodule.exports = {\n  phoeuserlist: phoeuserlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
    }
    console.log(phoeuserlist);
  }
};
