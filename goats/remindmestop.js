const fs = require("fs");
const { chimuserlist, chimidlist } = require("./chimusers.js");
const { phoeuserlist, phoeidlist } = require("./phoeusers");

module.exports = {
  name: "remindme stop",
  description: "Stops all user reminders",
  execute(message, args) {
    //Updating user files to indicate enabled
    let username = message.author.username;
    if (
      (chimuserlist[username] === "chimDisable" && phoeuserlist[username]) ===
      "phoeDisable"
    ) {
      return message.channel.send("You have no reminders to clear");
    } else {
      if (chimuserlist[username] === "chimEnable") {
        delete chimidlist[username];
        chimuserlist[username] = "chimDisable";
      }
      if (phoeuserlist[username] === "phoeEnable") {
        delete phoeidlist[username];
        phoeuserlist[username] = "phoeDisable";
      }
      message.channel.send("All user reminders cleared!");
      const chimuserkeys = Object.keys(chimuserlist);
      const chimuservalues = Object.values(chimuserlist);
      const chimidkeys = Object.keys(chimidlist);
      const chimidvalues = Object.values(chimidlist);
      const phoeuserkeys = Object.keys(phoeuserlist);
      const phoeuservalues = Object.values(phoeuserlist);
      const phoeidkeys = Object.keys(phoeidlist);
      const phoeidvalues = Object.values(phoeidlist);
      let chimidobject = [];
      let chimuserobject = [];
      let phoeidobject = [];
      let phoeuserobject = [];

      for (let i = 0; i < chimuserkeys.length; i++) {
        chimuserobject.push(` ${chimuserkeys[i]} : "${chimuservalues[i]}"`);
      }
      for (let i = 0; i < chimidkeys.length; i++) {
        chimidobject.push(` ${chimidkeys[i]} : "${chimidvalues[i]}"`);
      }
      for (let i = 0; i < phoeuserkeys.length; i++) {
        phoeuserobject.push(` ${phoeuserkeys[i]} : "${phoeuservalues[i]}"`);
      }
      for (let i = 0; i < phoeidkeys.length; i++) {
        phoeidobject.push(` ${phoeidkeys[i]} : "${phoeidvalues[i]}"`);
      }
      fs.writeFile(
        "./goats/chimusers.js",
        `let chimuserlist = {${chimuserobject}}\nlet chimidlist = {${chimidobject}}\n\nmodule.exports = {\n  chimuserlist: chimuserlist,\nchimidlist: chimidlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
      fs.writeFile(
        "./goats/phoeusers.js",
        `let phoeuserlist = {${phoeuserobject}}\nlet phoeidlist = {${phoeidobject}}\n\nmodule.exports = {\n  phoeuserlist: phoeuserlist, phoeidlist: phoeidlist\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
    }
  }
};
