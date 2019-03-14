const { api } = require("../config.json");
const { google } = require("googleapis");
const sheets = google.sheets("v4");
const { weekday, maps } = require("./variables.js");

let cdata = [];
module.exports = {
  name: "goatsc",
  description: "Chimera World Boss Time",
  execute(message, args) {
    const d = new Date();
    //Converts date into universal time in milliseconds
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    // EST = GMT -5
    const offset = -4;
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
        if (cdata[1].includes("No ETA Yet")) {
          message.channel.send("Currently Unavailable (๑•́ω•̀)");
        }

        let countString = cdata[3];
        //Taking off unnecesarry characters and converting to array
        countString = countString.replace(/:/g, ",");
        countString = countString.replace("AM", "");
        countString = countString.replace("PM", "");
        console.log(countString);
        const countArray = countString.split(",").map(Number);
        let nextSpawn = `${cdata[0].toLowerCase()}, ${cdata[3]}`;
        let timeofSpawn = cdata[3];

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
        if (diff > 14400000) {
          countArray[0] += 4;
          countertime = new Date(
            count.getFullYear(),
            count.getMonth(),
            count.getDate() + 1,
            countArray[0],
            countArray[1],
            countArray[2]
          );
          countTime = countertime.getTime();
          diff = parseInt(countTime - gameTime);
          nextSpawn = `${cdata[0].toLowerCase()}, ${countArray[0] + 4}:${
            countArray[1]
          }:${countArray[2]} ${countArray[0] > 12 ? "PM" : "AM"}`;
          timeofSpawn = `${countArray[0] + 4}:${countArray[1]}:${
            countArray[2]
          } ${countArray[0] > 12 ? "PM" : "AM"}`;
        }
        if (diff > 86400000) {
          countArray[0] += 4;
          countertime = new Date(
            count.getFullYear(),
            count.getMonth(),
            count.getDate(),
            countArray[0],
            countArray[1],
            countArray[2]
          );
          countTime = countertime.getTime();
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
                value: "```xl\n\n" + timeofSpawn + "```",
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
};
