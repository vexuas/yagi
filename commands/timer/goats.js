const { api } = require('../../config.json');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { getServerTime, formatCountdown, formatLocation } = require('../../helpers');
const {
  format,
  differenceInMilliseconds,
  distanceInWordsStrict,
  addHours,
  addDays,
  isAfter
} = require('date-fns');
//----------
/**
 * GET request to spreadsheet for values
 * spreadsheetId is 'https:~~/spreadsheets/d/{spreadsheetId}/~~~'
 * ranges is which multiple rows/columns/cells you need from the sheet
 * auth is the oauth token
 * Since it's a public sheet, I set up a personal api token for use as no authentication required
 * Passed in a callback function to send the message to user after everything is done
 */
const getWorldBossData = function requestToExternalSpreadsheetAndReturnReadableData(
  message,
  sendMessageCallback
) {
  const authClient = api;
  const request = {
    spreadsheetId: 'tUL0-Nn3Jx7e6uX3k4_yifQ',

    ranges: ['C4', 'C6', 'C8', 'E22', 'H22', 'C10'],

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
      bisolenCount: actualSheetValues[4],
      countdown: actualSheetValues[5]
    };
    console.log(worldBossData.countdown);
    sendMessageCallback(message, generateEmbed(worldBossData));
  });
};
//----------
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

  const nextSpawnDate = `${currentMonth} ${currentDay}, ${currentYear} ${nextSpawn}`; //August 19, 2019 9:56:21 PM
  const eightPMCutOff = `${currentMonth} ${currentDay}, ${currentYear} 8:00:00 PM`; //August 19, 2019 8:00:00 PM

  //To be as accurate as possible
  const countdownValidity = differenceInMilliseconds(nextSpawnDate, serverTime);
  console.log(countdownValidity);
  /**
   * Normal timer: (12am - 7:59pm)
   * Late Night timer: (8pm - 11:59pm)
   * Edge Case: No editor to update sheet
   * Using 8pm cuz wb spawns every 4 hours so anything after 8 is already past midnight
   */
  if (countdownValidity >= 0) {
    //Countdown still counting down
    return formatCountdown(nextSpawnDate, serverTime);
  } else if (isAfter(nextSpawnDate, eightPMCutOff) && countdownValidity < 0) {
    //servertime is over 8pm and no editor updated sheet
    return formatCountdown(addDays(addHours(nextSpawnDate, 4), 1), serverTime); //+4 hours and +1 day to current nextSpawnDate
  } else if (isAfter(nextSpawnDate, eightPMCutOff) && nextSpawnDate.includes('AM')) {
    //midnight timer; servertime is over 8pm and sheet is updated
    return formatCountdown(addDays(nextSpawnDate, 1), serverTime); //+1 day to current nextSpawnDate
  } else if (countdownValidity < 0) {
    //normal timer and no editor updated sheet
    return formatCountdown(addHours(nextSpawnDate, 4), serverTime); //+4 hours to current nextSpawnDate
  }
};
//----------
/**
 * Designing part of what to send back to user
 * Not too sure if it's better using discord's .RichEmbed()
 * but sticking to this since I got used to it
 */
const generateEmbed = function generateWorldBossEmbedToSend(worldBossData) {
  const grvAcnt = '`'; //Making this a variable to make use of concatenation

  const serverTimeDesc = `Server Time: ${grvAcnt}${format(
    getServerTime(),
    'dddd, h:mm:ss A'
  )}${grvAcnt}`;

  const spawnDesc = `Spawn: ${grvAcnt}${worldBossData.location.toLowerCase()}, ${
    worldBossData.nextSpawn
  }${grvAcnt}`;
  /** 
   * This is far easier to get countdown but it isn't as reliable and accurate
   * I'll just leave it here for reference
  const countdownSheet = worldBossData.countdown.split(':');
  const countdownString = `${countdownSheet[0]} hrs ${countdownSheet[1]} mins ${
    countdownSheet[2]
  } secs`;
  **/
  const embedData = {
    title: 'Olympus | World Boss',
    description: `${serverTimeDesc}\n${spawnDesc}`,
    color: 32896,
    thumbnail: {
      url:
        'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
    },
    fields: [
      {
        name: 'Location',
        value: '```fix\n\n' + formatLocation(worldBossData.location) + '```'
      },
      {
        name: 'Countdown',
        value: '```xl\n\n' + getCountdown(worldBossData.nextSpawn) + '```',
        inline: true
      },
      {
        name: 'Time of Spawn',
        value: '```xl\n\n' + worldBossData.nextSpawn + '```',
        inline: true
      }
    ]
  };
  return embedData;
};
//----------
/**
 * Used as a callback function since this should be the last thing to be triggered
 * Passed in another function as a parameter so it gets called after everything else is done
 * */
const sendMessage = function sendMessageToUser(message, embedData) {
  const embed = embedData;
  message.channel.send({ embed });
};
//----------
module.exports = {
  name: 'goats',
  description: 'Olympus World Boss Time',
  execute(message) {
    //Since it'll take a couple of seconds to finish the request, adding bot type to show in-progress
    message.channel.startTyping();
    getWorldBossData(message, sendMessage);
    message.channel.stopTyping();
  }
};
