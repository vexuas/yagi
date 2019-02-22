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
const phoemaps = {
  VV1: "V1",
  VV2: "V2",
  VV3: "V3",
  VV4: "V4",
  VV5: "V5",
  VV6: "V6",
  BB1: "B1",
  BB2: "B2",
  BB3: "B3",
  BB4: "B4",
  BB5: "B5",
  BB6: "B6"
};
const ampm = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "11": 11,
  "12": 12,
  "13": 1,
  "14": 2,
  "15": 3,
  "16": 4,
  "17": 5,
  "18": 6,
  "19": 7,
  "20": 8,
  "21": 9,
  "22": 10,
  "23": 11,
  "24": 0
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
let pdata = [];
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

  //Chimera Goats Command
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
        countString = countString.replace(/:/g, ",");
        countString = countString.replace("AM", "");
        countString = countString.replace("PM", "");
        console.log(countString);
        const countArray = countString.split(",").map(Number);

        if (cdata[3].includes("PM")) {
          countArray[0] += 12;
        }
        console.log(countArray);
        const count = new Date(gameTime);
        let countertime = new Date(
          count.getFullYear(),
          count.getMonth(),
          count.getDate(),
          countArray[0],
          countArray[1],
          countArray[2]
        );
        let countTime = countertime.getTime();
        let diff = parseInt(countTime - gameTime);
        if (diff < 0 && cdata[2].includes("PM")) {
          countTime += 24 * 60 * 60 * 1000;
          diff = parseInt(countTime - gameTime);
        }
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
  //Phoenix Goats Command
  if (message.content == "+goatsp") {
    pdata = [];
    authorize(function(authClient) {
      const request = {
        spreadsheetId: "1MrMwNerILxNK0lvKCBklkYZx_OKAb4io8XdaldRyO_g",
        range: "B11:D11",
        auth: authClient
      };
      sheets.spreadsheets.values.get(request, function(err, response) {
        if (err) {
          console.error(err);
          message.channel.send("Currently Unavailable (๑•́ω•̀)");
        }

        console.log(response.data.values[0]);
        response.data.values[0].forEach(item => {
          pdata.push(item);
        });
        let countString = pdata[1] + pdata[2];
        if (countString.includes("U")) {
          message.channel.send("Currently Unavailable (๑•́ω•̀)");
        }
        //Taking off unnecesarry characters and converting to array
        countString = countString.replace(/:/g, ",");
        let countArray = countString.split(",").map(Number);

        const count = new Date(gameTime);
        let countertime = new Date(
          count.getFullYear(),
          count.getMonth(),
          count.getDate(),
          countArray[0],
          countArray[1],
          countArray[2]
        );
        let countTime = countertime.getTime();
        let diff = parseInt(countTime - gameTime);
        let timeofday = "AM";
        let ampmstring = countArray[0].toString();
        console.log(ServerTime);
        if (diff < 0 && ServerTime.includes("AM")) {
          countTime += 12 * 60 * 60 * 1000;
          diff = parseInt(countTime - gameTime);
          timeofday = "PM";
          console.log("hello");
        }
        if (diff < 0 && ServerTime.includes("PM")) {
          countTime += 24 * 60 * 60 * 1000;
          diff = parseInt(countTime - gameTime);
          timeofday = "AM";
        }
        if (diff > 14400000) {
          countArray[0] += 4;
          ampmstring = countArray[0].toString();
          countertime = new Date(
            count.getFullYear(),
            count.getMonth(),
            count.getDate() + 1,
            ampm[countArray[0]],
            countArray[1],
            countArray[2]
          );
          countTime = countertime.getTime();
          diff = parseInt(countTime - gameTime);
          timeofday = "AM";
        }
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
          console.log(countdown);
          const nextSpawn = `${phoemaps[pdata[0]].toLowerCase()}, ${
            ampm[ampmstring]
          }${pdata[2]} ${timeofday}`;
          const embed = {
            title: "Phoenix | Goats",
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
                value: "```fix\n\n" + maps[phoemaps[pdata[0]]] + "```"
              },
              {
                name: "Countdown",
                value: "```xl\n\n" + countdown + "```",
                inline: true
              },
              {
                name: "Time of Spawn",
                value:
                  "```xl\n\n" +
                  ampm[ampmstring] +
                  pdata[2] +
                  " " +
                  timeofday +
                  "```",
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
