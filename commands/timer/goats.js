const { api } = require('../../config.json');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { getServerTime, formatCountdown } = require('../../helpers');
const { format, differenceInMilliseconds, distanceInWordsStrict } = require('date-fns');

// const embed = {
//   title: 'Chimera | Goats',
//   description:
//     'Server Time : `' + weekday[day] + ', ' + ServerTime + '`\nSpawn : `' + nextSpawn + '`',
//   color: 32896,
//   thumbnail: {
//     url:
//       'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
//   },
//   fields: [
//     {
//       name: 'Location',
//       value: '```fix\n\n' + maps[cdata[0]] + '```'
//     },
//     {
//       name: 'Countdown',
//       value: '```xl\n\n' + countdown + '```',
//       inline: true
//     },
//     {
//       name: 'Time of Spawn',
//       value: '```xl\n\n' + timeofSpawn + '```',
//       inline: true
//     }
//   ]
// };

const getWorldBossData = function requestToExternalSpreadsheetAndReturnReadableData(message) {
  const authClient = api;
  /**
   * GET request to spreadsheet for values
   * spreadsheetId is 'https:~~/spreadsheets/d/{spreadsheetId}/~~~'
   * ranges is which multiple rows/columns/cells you need from the sheet
   * auth is the oauth token
   * Since it's a public sheet, I set up a personal api token for use as no authentication required
   */
  const request = {
    spreadsheetId: 'tUL0-Nn3Jx7e6uX3k4_yifQ',

    ranges: ['C4', 'C6', 'C8', 'E22', 'H22'],

    auth: authClient
  };

  sheets.spreadsheets.values.batchGet(request, function(err, response) {
    if (err) {
      console.error(err);
      return;
    }
    const rawSheetValues = response.data.valueRanges;
    /**
     * rawSheetValues is the response which is an array of objects
     * The data we need is the values key inside each object
     * First Object: Location
     * Second Object: Last Spawn
     * Third Object: Next Spawn
     * Fourth Object: Banoleth Spawn
     * Fifth Object: Bisolen Spawn
     * Below extracts the actual data and pushes them in a new array
     * Then sets the value to its corresponding data key
     */
    let actualSheetValues = [];
    rawSheetValues.forEach(item => {
      actualSheetValues.push(item.values[0][0]);
    });
    const worldBossData = {
      location: actualSheetValues[0],
      lastSpawn: actualSheetValues[1],
      nextSpawn: actualSheetValues[2],
      banolethCount: actualSheetValues[3],
      bisolenCount: actualSheetValues[4]
    };
    message.channel.send(format(getServerTime(), 'ddd, hh:mm:ss A'));
    message.channel.send(worldBossData.location);
    message.channel.send(getCountdown(worldBossData.nextSpawn));
  });
};

/**
 * Such hack, much wow
 * Dealing with time in js seriously will make you insane at some point
 * At least new Date accepts AM/PM so that lessens the voodoo
 * Esentially what this function does is extract the month, year & day of serverTime
 * and use that to get the date of nextSpawn
 * 1 edge case with this during close midnight since it'll be a different day for nextSpawn then
 * but otherwise, I feel like this is good enough to calculate the countdown
 * Could always extract from sheet itself. It'll work here but I can't use that number for the website
 */
const getCountdown = function calculateCountdownThroughNextSpawnAndServerTime(nextSpawn) {
  const serverTime = getServerTime();
  const currentDay = format(serverTime, 'D');
  const currentMonth = format(serverTime, 'MMMM');
  const currentYear = format(serverTime, 'YYYY');

  const nextSpawnDate = `${currentMonth} ${currentDay}, ${currentYear} ${nextSpawn}`;

  //To be as accurate as possible
  const countdownValidity = differenceInMilliseconds(nextSpawnDate, serverTime);
  /**
   * Case 1: Normal timer (12am - 7:59pm)
   * Case 2: Late Night timer (8pm - 11:59pm)
   * Edge Case: No editor to update sheet
   */
  console.log(countdownValidity);
  if (countdownValidity >= 0) {
    return formatCountdown(serverTime, nextSpawnDate);
  } else {
    //Todo: Last day of month function along with nextday function
  }
};

module.exports = {
  name: 'goats',
  description: 'Olympus World Boss Time',
  execute(message) {
    //Since it'll take a couple of seconds to finish the request, adding bot type to show in-progress
    message.channel.startTyping();
    getWorldBossData(message);
    message.channel.stopTyping();
  }
};
