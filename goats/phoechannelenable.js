const fs = require("fs");
const { phoechannellist, phoechannelid } = require("./phoechannels.js");
const reminders = require("../yagi");

module.exports = {
  name: "remindhere goatsp",
  description: "channel enable reminder function",
  execute(message, args) {
    //Updating user files to indicate enabled
    let servername = message.channel.guild.name;
    let channelname = message.channel.name;
    let fullname = `${servername}-${channelname}`;
    console.log(fullname);
    let channelid = message.channel.id;
    console.log(channelid);
    if (phoechannellist[fullname] === "enable") {
      return message.channel.send("Channel reminder is already enabled");
    } else {
      reminders.addPhoeChannel(fullname, channelid);
      message.channel.send("Channel reminder enabled!");
      phoechannellist[fullname] = "enable";
      phoechannelid[fullname] = channelid; //Setting userID to send message later
      const channelkeys = Object.keys(phoechannellist);
      const channelvalues = Object.values(phoechannellist);
      const channelidkeys = Object.keys(phoechannelid);
      const channelidvalues = Object.values(phoechannelid);
      let channelidobject = [];
      let channelobject = [];
      for (let i = 0; i < channelkeys.length; i++) {
        channelobject.push(` "${channelkeys[i]}" : "${channelvalues[i]}"`);
      }
      for (let i = 0; i < channelidkeys.length; i++) {
        channelidobject.push(
          ` "${channelidkeys[i]}" : "${channelidvalues[i]}"`
        );
      }
      fs.writeFile(
        "./goats/phoechannels.js",
        `let phoechannellist = {${channelobject}}\nlet phoechannelid = {${channelidobject}}\n\nmodule.exports = {\n  phoechannellist: phoechannellist, phoechannelid: phoechannelid\n}`,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        }
      );
    }
    console.log(phoechannellist);
  }
};
