const { chimchannellist } = require("./chimchannels.js");
const { phoechannellist } = require("./phoechannels.js");

const reminders = {
  goatsc: "• Chimera Goat Times (`+goatsc`)",
  goatsp: "• Phoenix Goat Times (`+goatsp`)"
};

let channelReminders = [];
function getListReminders(message) {
  channelReminders = [];
  let servername = message.channel.guild.name;
  let channelname = message.channel.name;
  let fullname = `${servername}-${channelname}`;
  if (chimchannellist[fullname] === "enable") {
    channelReminders.push("goatsc");
  }
  if (phoechannellist[fullname] === "enable") {
    channelReminders.push("goatsp");
  }
  const reminderOutput = channelReminders
    .map(item => {
      return reminders[item];
    })
    .join("\n");
  const embed = {
    title: `${fullname} | Active Channel Reminders`,
    description: `${reminderOutput}`,
    color: 32896
  };
  if (reminderOutput === "") {
    return message.channel.send(
      "There are no active reminders in this channel"
    );
  }
  message.channel.send({ embed });
}

module.exports = {
  name: "remindhere list",
  description: "lists active reminders",
  execute(message, args) {
    if (message.channel.type !== "text") {
      return message.author.send(
        "You can only view the channel reminder list in a server channel"
      );
    }
    getListReminders(message);
  }
};
