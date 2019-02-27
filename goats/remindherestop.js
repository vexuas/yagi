const fs = require("fs");
const { chimchannellist, chimchannelid } = require("./chimchannels.js");
const { phoechannellist, phoechannelid } = require("./phoechannels.js");
const reminders = require("../yagi");

module.exports = {
  name: "remindhere stop",
  description: "Stops all channel reminders",
  execute(message, args) {
    //Updating user files to indicate enabled
    let servername = message.channel.guild.name;
    let channelname = message.channel.name;
    let fullname = `${servername}-${channelname}`;
    if (message.channel.type !== "text") {
      return message.author.send(
        "Channel reminders can only be used in a server channel by an administrator"
      );
    } else if (message.member.hasPermission("ADMINISTRATOR")) {
      if (
        (chimchannellist[fullname] === "disable" &&
          phoechannellist[fullname]) === "disable"
      ) {
        return message.channel.send(
          "There are no reminders in this channel to clear"
        );
      } else {
        if (chimchannellist[fullname] === "enable") {
          reminders.removeChimChannel(fullname);
          delete chimchannelid[fullname];
          chimchannellist[fullname] = "disable";
          const chimchannelkeys = Object.keys(chimchannellist);
          const chimchannelvalues = Object.values(chimchannellist);
          const chimchannelidkeys = Object.keys(chimchannelid);
          const chimchannelidvalues = Object.values(chimchannelid);
          let chimchannelidobject = [];
          let chimchannelobject = [];
          for (let i = 0; i < chimchannelkeys.length; i++) {
            chimchannelobject.push(
              ` "${chimchannelkeys[i]}" : "${chimchannelvalues[i]}"`
            );
          }
          for (let i = 0; i < chimchannelidkeys.length; i++) {
            chimchannelidobject.push(
              ` "${chimchannelidkeys[i]}" : "${chimchannelidvalues[i]}"`
            );
          }
          fs.writeFile(
            "./goats/chimchannels.js",
            `let chimchannellist = {${chimchannelobject}}\nlet chimchannelid = {${chimchannelidobject}}\n\nmodule.exports = {\n  chimchannellist: chimchannellist,\nchimchannelid: chimchannelid\n}`,
            function(err) {
              if (err) {
                return console.log(err);
              }
              console.log("The file was saved!");
            }
          );
        }
        if (phoechannellist[fullname] === "enable") {
          reminders.removePhoeChannel(fullname);
          delete phoechannelid[fullname];
          phoechannellist[fullname] = "disable";
          const phoechannelkeys = Object.keys(phoechannellist);
          const phoechannelvalues = Object.values(phoechannellist);
          const phoechannelidkeys = Object.keys(phoechannelid);
          const phoechannelidvalues = Object.values(phoechannelid);
          let phoechannelidobject = [];
          let phoechannelobject = [];

          for (let i = 0; i < phoechannelkeys.length; i++) {
            phoechannelobject.push(
              ` "${phoechannelkeys[i]}" : "${phoechannelvalues[i]}"`
            );
          }
          for (let i = 0; i < phoechannelidkeys.length; i++) {
            phoechannelidobject.push(
              ` "${phoechannelidkeys[i]}" : "${phoechannelidvalues[i]}"`
            );
          }
          fs.writeFile(
            "./goats/phoechannels.js",
            `let phoechannellist = {${phoechannelobject}}\nlet phoechannelid = {${phoechannelidobject}}\n\nmodule.exports = {\n  phoechannellist: phoechannellist, phoechannelid: phoechannelid\n}`,
            function(err) {
              if (err) {
                return console.log(err);
              }
              console.log("The file was saved!");
            }
          );
        }
        message.channel.send("All channel reminders cleared!");
      }
    } else {
      message.channel.send(
        "You need administrative rights to use this command"
      );
    }
  }
};
