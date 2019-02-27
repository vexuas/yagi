const { api } = require("../config.json");
const { google } = require("googleapis");
const sheets = google.sheets("v4");
const { weekday, maps, phoemaps, ampm } = require("./variables.js");
let phoeUserIntervals = [];
let phoeChanIntervals = [];

function phoenixTime(response, id, intervals) {
  intervals.push(
    setInterval(() => {
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
      //adding 1 second more for ctimer
      const nowtime = new Date(gameTime + 1000);
      const newtime = nowtime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      //Gets day from Date Object, returns a number(0-6)
      const day = serverTime.getDay();
      pdata = [];
      console.log(response.data.values[0]);
      response.data.values[0].forEach(item => {
        pdata.push(item);
      });
      let countString = pdata[1] + pdata[2];
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
      if (diff < 0) {
        countertime = new Date(
          count.getFullYear(),
          count.getMonth(),
          count.getDate(),
          countArray[0] + 12,
          countArray[1],
          countArray[2]
        );
        countTime = countertime.getTime();
        diff = parseInt(countTime - gameTime);
        timeofday = "PM";
        console.log("hello");
      }
      if ((diff < 0) & ServerTime.includes("PM")) {
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
      if (diff > 86400000) {
        ampmstring = countArray[0].toString();
        countertime = new Date(
          count.getFullYear(),
          count.getMonth(),
          count.getDate(),
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
            newtime +
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
        if (countdown === "1 hr 00 min 00 sec") {
          id.send("`wb starting in 1 hour on Phoenix`");
          id.send({ embed });
        }
        if (countdown === "0 hr 10 mins 00 sec") {
          id.send("`wb starting in 10 minutes on Phoenix!`");
          id.send({ embed });
        }
        console.log(ServerTime);
        console.log(newtime);
      }
    }, 1000)
  );
}

function phoenixTimer(id, intervals) {
  let pdata = [];
  console.log("phoetest");
  authorize(function(authClient) {
    const request = {
      spreadsheetId: "1MrMwNerILxNK0lvKCBklkYZx_OKAb4io8XdaldRyO_g",
      range: "B11:D11",
      auth: authClient
    };
    sheets.spreadsheets.values.get(request, function(err, response) {
      if (err) {
        console.error(err);
        phoenixTimer();
      }
      phoenixTime(response, id, intervals);
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
module.exports.phoenixTimer = phoenixTimer;
module.exports.phoeUserIntervals = phoeUserIntervals;
module.exports.phoeChanIntervals = phoeChanIntervals;
