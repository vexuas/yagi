const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token, api } = require("./config.json");
const { google } = require("googleapis");
const sheets = google.sheets("v4");

const yagi = new Discord.Client();
yagi.commands = new Discord.Collection();

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
  "Last update: 21/02/2019"
];

function checkUserlist() {
  const { userlist } = require("./goats/users.js");
  console.log(userlist);
}

yagi.on("ready", () => {
  yagi.user.setActivity(activitylist[0]);
  checkUserlist();
  let channel = yagi.channels.get("491832593529045003");
  channel.send("test");
  setInterval(() => {
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
  const reminderInterval = setInterval(() => {
    const ex = yagi.commands.get("ctimer").execute();
    channel.send(ex);
  }, 10000);
});

yagi.login(token);

yagi.on("message", message => {
  if (!message.content.startsWith(prefix)) return;
  //get commands
  const args = message.content.slice(prefix.length).split();
  const command = args.shift().toLowerCase();
  //if command doesn't exist, show error message
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
