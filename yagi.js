const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const { chimidlist, chimuserlist } = require("./goats/chimusers");
const { phoeidlist, phoeuserlist } = require("./goats/phoeusers");
const { chimeraTimer, chimIntervals } = require("./goats/ctimer");
const { phoenixTimer, phoeIntervals } = require("./goats/ptimer");

let chimIds = Object.values(chimidlist);
let phoeIds = Object.values(phoeidlist);
const yagi = new Discord.Client();
yagi.commands = new Discord.Collection();
console.log(chimIds);
console.log(phoeIds);
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
  "Last update: 25/02/2019"
];
//Add and removes user reminders
function addChimUser(username, userid) {
  chimidlist[username] = userid;
  chimIds = Object.values(chimidlist);
  console.log(chimIds);
  chimReminderSend(chimIds);
}
function removeChimUser(username) {
  delete chimidlist[username];
  chimIds = Object.values(chimidlist);
  console.log(chimIds);
  chimReminderSend(chimIds);
}
function addPhoeUser(username, userid) {
  phoeidlist[username] = userid;
  phoeIds = Object.values(phoeidlist);
  phoeReminderSend(phoeIds);
}
function removePhoeUser(username) {
  delete phoeidlist[username];
  phoeIds = Object.values(phoeidlist);
  phoeReminderSend(phoeIds);
}
//Starts reminder countdown for users
function chimReminderSend(chimera) {
  chimera.forEach(item => {
    const chimuserId = yagi.users.get(item);
    chimeraTimer(chimuserId);
  });
}
function phoeReminderSend(phoenix) {
  phoenix.forEach(item => {
    const phoeuserId = yagi.users.get(item);
    phoenixTimer(phoeuserId);
  });
}
yagi.on("ready", () => {
  yagi.user.setActivity(activitylist[0]);
  let channel = yagi.channels.get("491832593529045003");
  channel.send("test");
  yagi.users.forEach(item => {
    console.log(item.username);
    console.log(item.id);
  });
  chimReminderSend(chimIds);
  phoeReminderSend(phoeIds);
  setInterval(() => {
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
  //Gets data from sheet every 10 minutes
  setInterval(() => {
    chimIntervals.forEach(interval => {
      clearInterval(interval);
    });
    chimIntervals.splice(0, chimIntervals.length);
    chimReminderSend(chimIds);
    phoeIntervals.forEach(interval => {
      clearInterval(interval);
    });
    phoeIntervals.splice(0, phoeIntervals.length);
    phoeReminderSend(phoeIds);
    console.log("10 minute sheet checkup");
  }, 600000);
});

yagi.login(token);

yagi.on("message", message => {
  if (!message.content.startsWith(prefix)) return;
  //get commands
  const args = message.content.slice(prefix.length).split();
  const command = args.shift().toLowerCase();
  //if command doesn't exist, show error message
  let userid = message.author.id;
  let username = message.author.username;
  if (message.content === "+remindme goatsc") {
    if (chimuserlist[username] !== "chimEnable") {
      chimIntervals.forEach(interval => {
        clearInterval(interval);
      });
      chimIntervals.splice(0, chimIntervals.length);
      addChimUser(username, userid);
    }
  }
  if (message.content === "+remindme! goatsc") {
    if (chimuserlist[username] !== "chimDisable") {
      chimIntervals.forEach(interval => {
        clearInterval(interval);
      });
      chimIntervals.splice(0, chimIntervals.length);
      removeChimUser(username);
    }
  }
  if (message.content === "+remindme goatsp") {
    if (phoeuserlist[username] !== "phoeEnable") {
      phoeIntervals.forEach(interval => {
        clearInterval(interval);
      });
      phoeIntervals.splice(0, phoeIntervals.length);
      addPhoeUser(username, userid);
    }
  }
  if (message.content === "+remindme! goatsp") {
    if (phoeuserlist[username] !== "phoeDisable") {
      phoeIntervals.forEach(interval => {
        clearInterval(interval);
      });
    }
    phoeIntervals.splice(0, phoeIntervals.length);
    removePhoeUser(username);
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
