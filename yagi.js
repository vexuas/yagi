const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const { chimidlist, chimuserlist } = require("./goats/chimusers");
const { phoeidlist, phoeuserlist } = require("./goats/phoeusers");
const { chimchannelid, chimchannellist } = require("./goats/chimchannels");
const { phoechannelid, phoechannellist } = require("./goats/phoechannels");
const {
  chimeraTimer,
  chimUserIntervals,
  chimChanIntervals
} = require("./goats/ctimer");
const {
  phoenixTimer,
  phoeUserIntervals,
  phoeChanIntervals
} = require("./goats/ptimer");

let chimIds = Object.values(chimidlist);
let phoeIds = Object.values(phoeidlist);
let chimchannelIds = Object.values(chimchannelid);
let phoechannelIds = Object.values(phoechannelid);
const yagi = new Discord.Client();
yagi.commands = new Discord.Collection();

console.log(chimIds);
console.log(Object.keys(chimuserlist));
console.log(phoeIds);
console.log(Object.keys(phoeuserlist));
console.log(Object.keys(chimchannellist));
console.log(Object.keys(phoeuserlist));
const commandFiles = fs
  .readdirSync("./goats")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./goats/${file}`);
  yagi.commands.set(command.name, command);
}

yagi.once("ready", () => {
  console.log("Ready!");
});

const activitylist = [
  "+info for bot information",
  "+goatsc for Chimera wb",
  "+goatsp for Phoenix wb",
  "Last update: 10/03/2019"
];
/**
 * Add and removes user reminders
 * Every add/remove refreshes all reminders
 */
function addChimUser(username, userid) {
  chimidlist[username] = userid;
  chimIds = Object.values(chimidlist);
  console.log(chimIds);
  refreshReminders();
}
function removeChimUser(username) {
  delete chimidlist[username];
  chimIds = Object.values(chimidlist);
  console.log(chimIds);
  refreshReminders();
}
function addPhoeUser(username, userid) {
  phoeidlist[username] = userid;
  phoeIds = Object.values(phoeidlist);
  console.log(phoeIds);
  refreshReminders();
}
function removePhoeUser(username) {
  delete phoeidlist[username];
  phoeIds = Object.values(phoeidlist);
  console.log(phoeIds);
  refreshReminders();
}
//Add and removes channel reminders
function addChimChannel(channelname, channelid) {
  chimchannelid[channelname] = channelid;
  chimchannelIds = Object.values(chimchannelid);
  console.log(chimchannelIds);
  refreshReminders();
}
function removeChimChannel(channelname) {
  delete chimchannelid[channelname];
  chimchannelIds = Object.values(chimchannelid);
  console.log(chimchannelIds);
  refreshReminders();
}
function addPhoeChannel(channelname, channelid) {
  phoechannelid[channelname] = channelid;
  phoechannelIds = Object.values(phoechannelid);
  console.log(phoechannelIds);
  refreshReminders();
}
function removePhoeChannel(channelname) {
  delete phoechannelid[channelname];
  phoechannelIds = Object.values(phoechannelid);
  console.log(phoechannelIds);
  refreshReminders();
}
//Starts reminder countdowns
function chimUserReminderSend(chimera) {
  chimera.forEach(item => {
    const chimuserId = yagi.users.get(item);
    chimeraTimer(chimuserId, chimUserIntervals);
  });
}
function phoeUserReminderSend(phoenix) {
  phoenix.forEach(item => {
    const phoeuserId = yagi.users.get(item);
    phoenixTimer(phoeuserId, phoeUserIntervals);
  });
}

function chimChannelReminderSend(chimera) {
  chimera.forEach(item => {
    const chimchannelId = yagi.channels.get(item);
    chimeraTimer(chimchannelId, chimChanIntervals);
  });
}
function phoeChannelReminderSend(phoenix) {
  phoenix.forEach(item => {
    const phoechannelId = yagi.channels.get(item);
    phoenixTimer(phoechannelId, phoeChanIntervals);
  });
}
//Refreshing reminder intervals
function sendReminders() {
  chimUserReminderSend(chimIds);
  phoeUserReminderSend(phoeIds);
  chimChannelReminderSend(chimchannelIds);
  phoeChannelReminderSend(phoechannelIds);
}

function clearReminders() {
  chimUserIntervals.forEach(interval => {
    clearInterval(interval);
  });
  chimUserIntervals.splice(0, chimUserIntervals.length);
  phoeUserIntervals.forEach(interval => {
    clearInterval(interval);
  });
  phoeUserIntervals.splice(0, phoeUserIntervals.length);
  chimChanIntervals.forEach(interval => {
    clearInterval(interval);
  });
  chimChanIntervals.splice(0, chimChanIntervals.length);
  phoeChanIntervals.forEach(interval => {
    clearInterval(interval);
  });
  phoeChanIntervals.splice(0, phoeChanIntervals.length);
}
function refreshReminders() {
  clearReminders();
  sendReminders();
}

yagi.on("ready", () => {
  yagi.user.setActivity(activitylist[0]);
  let channel = yagi.channels.get("491832593529045003");
  channel.send("test");
  yagi.users.forEach(item => {
    console.log(item.username);
  });
  sendReminders();
  setInterval(() => {
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
  //Gets data from sheet every 10 minutes
  setInterval(() => {
    refreshReminders();
    console.log("30 second sheet checkup");
  }, 30000);
});

yagi.login(token);

yagi.on("message", message => {
  if (!message.content.startsWith(prefix)) return;
  //get commands
  const args = message.content.slice(prefix.length).split();
  const command = args.shift().toLowerCase();
  //if command doesn't exist, show error message
  if (message.content === "+remindhere") {
  }
  if (!yagi.commands.has(command))
    return message.channel.send("type `+info` for commands list");
  //if it does, do command
  try {
    message.channel.startTyping();
    setTimeout(() => {
      yagi.commands.get(command).execute(message, args);
    }, 500);
    return message.channel.stopTyping();
  } catch (error) {
    console.error(error);
  }
});

module.exports.addChimUser = addChimUser;
module.exports.addChimChannel = addChimChannel;
module.exports.addPhoeUser = addPhoeUser;
module.exports.addPhoeChannel = addPhoeChannel;
module.exports.removeChimUser = removeChimUser;
module.exports.removeChimChannel = removeChimChannel;
module.exports.removePhoeUser = removePhoeUser;
module.exports.removePhoeChannel = removePhoeChannel;
