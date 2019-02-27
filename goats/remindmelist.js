const { chimuserlist } = require("./chimusers.js");
const { phoeuserlist } = require("./phoeusers.js");

const reminders = {
  goatsc: "• Chimera Goat Times (`+goatsc`)",
  goatsp: "• Phoenix Goat Times (`+goatsp`)"
};

let userReminders = [];
function getListReminders(message) {
  userReminders = [];
  if (chimuserlist[message.author.username] === "enable") {
    userReminders.push("goatsc");
  }
  if (phoeuserlist[message.author.username] === "enable") {
    userReminders.push("goatsp");
  }
  const reminderOutput = userReminders
    .map(item => {
      return reminders[item];
    })
    .join("\n");
  const embed = {
    title: `${message.author.tag} | Active User Reminders`,
    description: `${reminderOutput}`,
    color: 32896
  };
  if (reminderOutput === "") {
    return message.channel.send("You have no active reminders");
  }
  message.channel.send({ embed });
}

module.exports = {
  name: "remindme list",
  description: "lists active reminders",
  execute(message, args) {
    getListReminders(message);
  }
};
