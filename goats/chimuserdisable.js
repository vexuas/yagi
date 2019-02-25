const fs = require("fs");
const { chimuserlist } = require("./chimusers.js");

module.exports = {
  name: "remindme! goatsc",
  description: "user disable reminder function",
  execute(message, args) {
    //Updating user files to indicate disabled
    let username = message.author.username;
    if (chimuserlist[username] === "chimDisable") {
      return message.channel.send("User reminder is already disabled");
    } else {
      message.channel.send("User reminder disabled!");
      chimuserlist[username] = "chimDisable";
      const userkeys = Object.keys(chimuserlist);
      const uservalues = Object.values(chimuserlist);
      let userobject = [];
      for (let i = 0; i < userkeys.length; i++) {
        userobject.push(` ${userkeys[i]} : "${uservalues[i]}"`);
      }
      fs.writeFile(
        "./goats/chimusers.js",
        `let chimuserlist = {${userobject}}\n\nmodule.exports = {\n  chimuserlist: chimuserlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
    }
    console.log(chimuserlist);
  }
};
