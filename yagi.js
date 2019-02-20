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
  "+goatsp for Phoenix wb"
];
yagi.on("ready", () => {
  yagi.user.setActivity(activitylist[0]);
  setInterval(() => {
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
});

yagi.login(token);
const maps = {
  V1: "Vulture's Vale Ch. 1 (X:161, Y:784)",
  V2: "Vulture's Vale Ch. 2 (X:161, Y:784)",
  V3: "Vulture's Vale Ch. 3 (X:161, Y:784)",
  V4: "Vulture's Vale Ch. 4 (X:161, Y:784)",
  V5: "Vulture's Vale Ch. 5 (X:161, Y:784)",
  V6: "Vulture's Vale Ch. 6 (X:161, Y:784)",
  B1: "Blizzard Berg Ch.1 (X:264, Y:743)",
  B2: "Blizzard Berg Ch.2 (X:264, Y:743)",
  B3: "Blizzard Berg Ch.3 (X:264, Y:743)",
  B4: "Blizzard Berg Ch.4 (X:264, Y:743)",
  B5: "Blizzard Berg Ch.5 (X:264, Y:743)",
  B6: "Blizzard Berg Ch.6 (X:264, Y:743)"
};

const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

let cdata = [];
yagi.on("message", message => {
  if (!message.content.startsWith(prefix)) return;
  //get commands
  const args = message.content.slice(prefix.length).split();
  const command = args.shift().toLowerCase();
  const d = new Date();
  //Converts date into universal time in milliseconds
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  // EST = GMT -5
  const offset = -5;
  //Game Time in milliseconds, universal time + difference in hours from utc(-5)
  const gameTime = utc + 3600000 * offset;
  //Returns a full Date Object of server time
  const serverTime = new Date(gameTime);
  //Format to only time string; 06:42 AM
  const ServerTime = serverTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  //Gets day from Date Object, returns a number(0-6)
  const day = serverTime.getDay();
  if (message.content == "+goatsc") {
    cdata = [];
    authorize(function(authClient) {
      const request = {
        spreadsheetId: "tUL0-Nn3Jx7e6uX3k4_yifQ",
        range: "B6:E6",
        auth: authClient
      };
      sheets.spreadsheets.values.get(request, function(err, response) {
        if (err) {
          console.error(err);
          message.channel.send("Currently Unavailable (๑•́ω•̀)");
        }

        console.log(response.data.values[0]);
        response.data.values[0].forEach(item => {
          cdata.push(item);
        });
        let countString = cdata[3];
        //Taking off unnecesarry characters and converting to array
        countString = countString.replace(":", ",");
        countString = countString.replace(":", ",");
        countString = countString.replace("AM", "");
        countString = countString.replace("PM", "");
        console.log(countString);
        const countArray = countString.split(",").map(Number);
        console.log(countArray);
        if (cdata[3].includes("PM")) {
          countArray[0] += 12;
        }
        const count = new Date(gameTime);
        const countertime = new Date(
          count.getFullYear(),
          count.getMonth(),
          count.getDate(),
          countArray[0],
          countArray[1],
          countArray[2]
        );
        const countTime = countertime.getTime();
        let diff = parseInt(countTime - gameTime);
        if (diff > 0) {
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          const hour = hours;
          const minute = ("00" + minutes).substr(-2);
          const second = ("00" + seconds).substr(-2);
          let hsuffix = "hrs";
          let msuffix = "mins";
          let ssuffix = "secs";
          if (hours < 2) {
            hsuffix = "hr";
          }
          if (minutes < 2) {
            msuffix = "min";
          }
          if (seconds < 2) {
            ssuffix = "sec";
          }
          let countdown = `${hour} ${hsuffix} ${minute} ${msuffix} ${second} ${ssuffix}`;
          if (hours < 0) {
            countdown = `${minute} ${msuffix} ${second} ${ssuffix}`;
          } else if (hours < 0 && minutes < 0) {
            countdown = `${second} ${ssuffix}`;
          }
          console.log(countdown);
          const nextSpawn = `${cdata[0].toLowerCase()}, ${cdata[3]}`;
          const embed = {
            title: "Chimera | Goats",
            description:
              "Server Time : `" +
              weekday[day] +
              ", " +
              ServerTime +
              "`\nSpawn : `" +
              nextSpawn +
              "`",
            color: 32896,
            thumbnail: {
              url:
                "https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png"
            },
            fields: [
              {
                name: "Location",
                value: "```fix\n\n" + maps[cdata[0]] + "```"
              },
              {
                name: "Countdown",
                value: "```xl\n\n" + countdown + "```",
                inline: true
              },
              {
                name: "Time of Spawn",
                value: "```xl\n\n" + cdata[3] + "```",
                inline: true
              }
            ]
          };
          message.channel.send({ embed });
        }
      });
    });

    function authorize(callback) {
      const authClient = api;

      if (authClient == null) {
        console.log("authentication failed");
        return;
      }
      callback(authClient);
    }
  }
  //if command doesn't exist, show error message
  if (!yagi.commands.has(command))
    return message.channel.send("type `+info` for commands list");
  //if it does, do command
  try {
    message.channel.startTyping();
    setTimeout(() => {
      yagi.commands.get(command).execute(message, args);
    }, 1000);
    return message.channel.stopTyping();
  } catch (error) {
    console.error(error);
  }
});
