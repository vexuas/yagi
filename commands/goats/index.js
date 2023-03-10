const { SlashCommandBuilder } = require('@discordjs/builders');
const { api, defaultPrefix } = require('../../config/yagi.json');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const {
  getServerTime,
  formatCountdown,
  formatLocation,
  isInWeeklyMaintenance,
} = require('../../utils/helpers');
const {
  format,
  differenceInMilliseconds,
  addHours,
  addDays,
  subDays,
  isAfter,
  isWithinRange,
  startOfDay,
  endOfDay,
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
const getWorldBossData = async function requestToExternalSpreadsheetAndReturnReadableData(
  interaction,
  sendMessageCallback
) {
  const authClient = api;
  const request = {
    spreadsheetId: 'tUL0-Nn3Jx7e6uX3k4_yifQ',

    ranges: ['C4', 'C6', 'C8', 'C10'],

    auth: authClient,
  };

  sheets.spreadsheets.values.batchGet(request, function (err, response) {
    try {
      const rawSheetValues = response.data.valueRanges;
      /**
       * rawSheetValues is the response which is an array of objects
       * The data we need is the values key inside each object
       * First Object: Location
       * Second Object: Last Spawn
       * Third Object: Next Spawn
       * Below extracts the actual data and pushes them in a new array
       * Then sets the value to its corresponding data key
       */
      let actualSheetValues = [];
      rawSheetValues.forEach((item) => {
        console.log(item.values);
        actualSheetValues.push(item.values[0][0]);
      });
      const worldBossData = {
        location: actualSheetValues[0],
        lastSpawn: actualSheetValues[1],
        nextSpawn: actualSheetValues[2],
        countdown: actualSheetValues[3],
      };
      console.log(worldBossData.countdown);
      sendMessageCallback(generateEmbed(worldBossData));
    } catch (e) {
      console.log(e);
      //For now I'll put this as default error message; I'm confident enough that this is the only time my timer will fail
      //Altho definitely have to add cases here in the future
      interaction.reply(
        'Oops! Sorry about that, looks like something went wrong. Try again in a bit!（・□・；）'
      );
    }
  });
};
//----------
/**
 * Such hack, much wow
 * Dealing with time in js seriously will make you insane at some point
 * At least new Date accepts AM/PM so that lessens the voodoo
 * Esentially what this function does is extract the month, year & day of serverTime
 * and use that to get the date of nextSpawn
 * Some complications during close midnight since it'll be a different day for nextSpawn then
 * but otherwise, I feel like this is good enough to calculate a reliable countdown
 * Could always extract from sheet itself. It'll work here but I can't use that number for the website
 * ----------
 * ToDo(?):
 * Add hourCountdownValidity to update values if editors miss updating sheet more than once in a row
 * So 1 miss is +4 hours(implemented), 2 miss + 8 hours and so on
 * It seems farfetched for more than 2 to happen, even just 2 misses in a row is pushing it already
 * Tho 1 miss would definitely happen most of the time
 */
const validateSpawn = function validateSpawnTimeUsingServerAndSpawnTime(worldBossData, serverTime) {
  const currentDay = format(serverTime, 'D');
  const currentMonth = format(serverTime, 'MMMM');
  const currentYear = format(serverTime, 'YYYY');

  const nextSpawnDate = `${currentMonth} ${currentDay}, ${currentYear} ${worldBossData.nextSpawn}`; //August 19, 2019 9:56:21 PM
  //Using 8pm cuz wb spawns every 4 hours so anything after 8 is already past midnight
  const eightPMCutOff = `${currentMonth} ${currentDay}, ${currentYear} 8:00:00 PM`; //August 19, 2019 8:00:00 PM

  //To be as accurate as possible
  const countdownValidity = differenceInMilliseconds(nextSpawnDate, serverTime);

  console.log(countdownValidity);

  if (
    isWithinRange(serverTime, startOfDay(serverTime), addHours(startOfDay(serverTime), 4)) &&
    isWithinRange(nextSpawnDate, eightPMCutOff, endOfDay(nextSpawnDate))
  ) {
    /**
     * Edge case - midnight timer; servertime is over 12am but spawnTime is before 12am; no editor updated sheet
     * -1 day and +4 hours to current nextSpawnDate
     * Putting this as first logic since the nature of how I calculate countdown requires it to be tested first for it to work
     * Any place other than here would result logic always firing countdownValidity >= 0
     */
    return {
      nextSpawn: format(addHours(subDays(nextSpawnDate, 1), 4), 'h:mm:ss A'),
      countdown: formatCountdown(addHours(subDays(nextSpawnDate, 1), 4), serverTime),
      accurate: false,
    };
  } else if (countdownValidity >= 0) {
    //normal timer (12am - 7:59pm server time) with updated sheet
    //Countdown still counting down
    return {
      nextSpawn: worldBossData.nextSpawn,
      countdown: formatCountdown(nextSpawnDate, serverTime),
      accurate: true,
    };
  } else if (isAfter(serverTime, eightPMCutOff) && nextSpawnDate.includes('AM')) {
    //late night timer; servertime is over 8pm and sheet is updated
    //+1 day to current nextSpawnDate
    return {
      nextSpawn: worldBossData.nextSpawn,
      countdown: formatCountdown(addDays(nextSpawnDate, 1), serverTime),
      accurate: true,
    };
  } else if (countdownValidity < 0) {
    //Edge case - no editor updated sheet for both normal and late night flow
    //+4 hours to current nextSpawnDate
    return {
      nextSpawn: format(addHours(nextSpawnDate, 4), 'h:mm:ss A'),
      countdown: formatCountdown(addHours(nextSpawnDate, 4), serverTime),
      accurate: false,
    };
  }
};
//----------
/**
 * Designing part of what to send back to user
 * Not too sure if it's better using discord's .RichEmbed()
 * but sticking to this since I got used to it
 */
const generateEmbed = function generateWorldBossEmbedToSend(worldBossData) {
  let embedData;
  const grvAcnt = '`'; //Making this a variable to make use of concatenation

  const serverTimeDesc = `Server Time: ${grvAcnt}${format(
    getServerTime(),
    'dddd, h:mm:ss A'
  )}${grvAcnt}`;
  const validatedSpawn = validateSpawn(worldBossData, getServerTime());
  /** 
   * This is far easier to get countdown but it isn't as reliable and accurate
   * I'll just leave it here for reference
  const countdownSheet = worldBossData.countdown.split(':');
  const countdownString = `${countdownSheet[0]} hrs ${countdownSheet[1]} mins ${
    countdownSheet[2]
  } secs`;
  **/
  const isTimerAccurate = validatedSpawn && validatedSpawn.accurate;
  if (isInWeeklyMaintenance(isTimerAccurate)) {
    embedData = {
      title: 'Olympus | World Boss',
      description: `${serverTimeDesc}`,
      color: 16776960,
      thumbnail: {
        url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
      },
      fields: [
        {
          name: 'Status',
          value:
            'Game servers have went down for weekly maintenance. Timer will be offline for a while; To get the next world boss spawn, refer to the [Olympus sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/htmlview?pru=AAABetvDVTc*CUO1z4a8sJgbuqturEfCGQ#) or wait in-game for world boss leads instructions',
        },
      ],
    };
  } else {
    const spawnDesc = `Spawn: ${grvAcnt}${worldBossData.location.toLowerCase()}, ${
      validatedSpawn.nextSpawn
    }${grvAcnt}`;
    const spawnFooter = validatedSpawn.accurate
      ? ''
      : `**Note that sheet data isn't up to date, timer accuracy might be off`;
    embedData = {
      title: 'Olympus | World Boss',
      description: `${serverTimeDesc}\n${spawnDesc}`,
      color: 32896,
      thumbnail: {
        url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
      },
      footer: {
        text: spawnFooter,
      },
      fields: [
        {
          name: 'Location',
          value: '```fix\n\n' + formatLocation(worldBossData.location) + '```',
        },
        {
          name: 'Countdown',
          value: '```xl\n\n' + validatedSpawn.countdown + '```',
          inline: true,
        },
        {
          name: 'Time of Spawn',
          value: '```xl\n\n' + validatedSpawn.nextSpawn + '```',
          inline: true,
        },
      ],
    };
  }
  return embedData;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goats')
    .setDescription(`Shows current timer for Vulture's Vale and Blizzard Berg World Boss`),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await getWorldBossData(interaction, async (embed) => {
        await interaction.editReply({ embeds: [embed] });
      });
    } catch (error) {
      console.log(error);
    }
  },
};