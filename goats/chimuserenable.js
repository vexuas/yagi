const fs = require("fs");
const { chimuserlist } = require("./chimusers.js");

module.exports = {
  name: "remindme goatsc",
  description: "user enable reminder function",
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    if (chimuserlist[username] === "chimEnable") {
      return message.channel.send("User reminder is already enabled");
    } else {
      message.channel.send("User reminder enabled!");
      chimuserlist[username] = "chimEnable";
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
