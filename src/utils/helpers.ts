/**
 * Any functions that aren't directly related to commands are here
 * This is just to improve readability
 * Don't really want to shove everything in its command file and make those messy
 */
import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInMilliseconds,
  subDays,
  subHours,
  subMinutes,
  addHours,
  addDays,
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { currentOffset } from '../config/offset.json';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID } from '../config/environment';
import { Client, Guild, TextChannel } from 'discord.js';
import { WorldBossData } from '../commands/goats';
const sheets = google.sheets('v4');

export const getServerTime = (): number => {
  //Current Date with Time
  const localTime = new Date();
  //Current time in milliseconds
  const localTimeinMs = localTime.getTime();
  //Difference between your timezone and UTC in hours
  const localTimezoneOffset = localTime.getTimezoneOffset() / 60;
  /**
   * The above is just for context
   * If you're at UTC +8 timezone, the offset is UTC +0 minus UTC +8
   * Below is more on how to get what you need
   * Pretty much you'll just need the server's timezoneoffset
   * And use that to configure localTime
   * With Dayllight Savings EDT offset: 5
   * Without: 4
   */

  //Maybe look into ways in making this automated instead of always having to manually change, would solve the delay in updating the timer everytime daylight savings comes around
  const serverTimezoneOffset = currentOffset; //EDT offset
  const timezoneDifference = localTimezoneOffset - serverTimezoneOffset;
  const serverTime = localTimeinMs + timezoneDifference * 3600000; //serverTime in milliseconds

  return serverTime;
};
/**
 * date-fns doesn't let you format distanceInWordsStrict yet
 * so can't return X hours, y mins, z seconds and can only get individually
 * This function tries to achieve this
 * TODO: Probably don't need this anymore; refactor this one day with distanceInWords
 */
export const formatCountdown = (nextSpawnDate: number | Date, serverTime: number): string => {
  let formattedCountdown = [];
  let calculatedTime = nextSpawnDate;
  /**
   * First checks hours and adds to array if it's over zero
   * If it is, substracts hours from calculatedTime
   * Then checks minutes and does the same thing and so on
   * Wrote additional logic since I'm such a grammar nazi
   * */
  const countdownHours = differenceInHours(calculatedTime, serverTime);
  if (countdownHours > 0) {
    calculatedTime = subHours(calculatedTime, countdownHours);

    switch (countdownHours) {
      case 1:
        formattedCountdown.push(`${countdownHours} hr`);
        break;
      default:
        formattedCountdown.push(`${countdownHours} hrs`);
    }
  }

  const countdownMinutes = differenceInMinutes(calculatedTime, serverTime);
  if (countdownMinutes > 0) {
    calculatedTime = subMinutes(calculatedTime, countdownMinutes);
    switch (countdownMinutes) {
      case 1:
        formattedCountdown.push(`${countdownMinutes} min`);
        break;
      default:
        formattedCountdown.push(`${countdownMinutes} mins`);
    }
  }

  const countdownSeconds = differenceInSeconds(calculatedTime, serverTime);
  if (countdownSeconds > 0) {
    switch (countdownSeconds) {
      case 1:
        formattedCountdown.push(`${countdownSeconds} sec`);
        break;
      default:
        formattedCountdown.push(`${countdownSeconds} secs`);
    }
  }
  return `${formattedCountdown.join(' ')}`;
};
/**
 * Sheet only returns short version of location (v1, b2 etc)
 * I want to show full version and this achieves that
 */
export const formatLocation = (rawLocation: string): string => {
  const prefixLocation = rawLocation.slice(0, 1).toLowerCase(); //Extracts the v/b in v1/b1
  const suffixLocation = rawLocation.slice(1, 2); //Extracts the 1/1 in v1/b1

  if (prefixLocation === 'v') {
    return `Vulture's Vale Ch.${suffixLocation} (X:161, Y:784)`;
  } else if (prefixLocation === 'b') {
    return `Blizzard Berg Ch.${suffixLocation} (X:264, Y:743)`;
  }
  return 'N/A';
};
/**
 * Server Embed for when bot joining and leaving a server
 * Add iconURL logic to always return a png extension
 * TODO: Refactor all of these
 * TODO: Add type for server embed
 */
export const serverEmbed = async (yagi: Client, guild: Guild, status: string) => {
  let embedTitle;
  let embedColor;
  const defaultIcon =
    'https://cdn.discordapp.com/attachments/248430185463021569/614789995596742656/Wallpaper2.png';
  if (status === 'join') {
    embedTitle = 'Joined a new server';
    embedColor = 55296;
  } else if (status === 'leave') {
    embedTitle = 'Left a server';
    embedColor = 16711680;
  }
  const guildIcon = guild.icon && guild.iconURL();
  const embed = {
    title: embedTitle,
    description: `I'm now in **${yagi.guilds.cache.size}** servers!`, //Removed users for now
    color: embedColor,
    thumbnail: {
      url: guildIcon ? guildIcon.replace(/jpeg|jpg/gi, 'png') : defaultIcon,
    },
    fields: [
      {
        name: 'Name',
        value: guild.name,
        inline: true,
      },
      {
        name: 'Owner',
        value:
          status === 'join'
            ? await guild.members.fetch(guild.ownerId).then((guildMember) => guildMember.user.tag)
            : '-',
        inline: true,
      },
      {
        name: 'Members',
        value: guild.memberCount.toString(),
        inline: true,
      },
    ],
  };
  return embed;
};
/**
 * Sends an error log to a specific channel for better error management
 * 620621811142492172: goat-logs channel in Yagi's Den
 * TODO: Refactor this to actually do proper error handling
 */
export const sendErrorLog = (client: Client, error: Error): void => {
  console.log(error);
  const logChannel = client.channels.cache.get('620621811142492172') as TextChannel;
  logChannel.send({ content: error.message });
};
/**
 * Function to extract data from the Olympus google spreadsheet
 * Returns readable data as an object for location, last spawn, next spawn and countdown
 * Note that last spawn and next spawn is only returned as time and not as a Date object
 * This is because the spreadsheet actually only gets the time from a private one that the leads use
 * If we can somehow get access to the private sheet and get the timestamp it would make our lives so much easier but it's whatever, we make do with what we have
 * To get the correct data, we need to pass in a request body when we make the call:
 * spreadsheetId: 'https:~~/spreadsheets/d/{spreadsheetId}/~~~'; taken from the url of the sheet
 * ranges: which cells you need from the sheet
 * auth: an authenticated token you can get from google's sheet api; as the sheet is public you can pretty much use any
 */
export const getWorldBossData = async (): Promise<WorldBossData> => {
  const authClient = GOOGLE_CLIENT_ID;
  const request = {
    spreadsheetId: 'tUL0-Nn3Jx7e6uX3k4_yifQ',

    ranges: ['C4', 'C6', 'C8', 'C10'],

    auth: authClient,
  };
  const actualSheetValues: string[] = [];

  try {
    const response = await sheets.spreadsheets.values.batchGet(request);
    const rawSheetValues = response.data.valueRanges;
    rawSheetValues &&
      rawSheetValues.forEach((item) => {
        item.values && actualSheetValues.push(item.values[0][0]);
      });
    return {
      location: actualSheetValues[0],
      lastSpawn: actualSheetValues[1],
      nextSpawn: actualSheetValues[2],
      countdown: actualSheetValues[3],
    };
  } catch (e) {
    console.log(e);
    //Add error handler here later
    throw e;
  }
};
/**
 * The ultimate voodoo
 * As the spreadsheet only offers a time variable and not the full date/timestamp for next spawn, we cannot fully rely on it as there would be gaps on some spawn times within the day
 * E.g. if server time is late night and next spawn should be the next day.
 * This function tries to get it right as much as possible by using the date of the server time itself and then transforming the raw next spawn time data into a date
 * With how complicated it is already to work with time in js, adding the fact that you only have time you'd expect a whole lotta voodoo and headaches trying to get this reasoably usable
 * So far the testing suites are all working fine so it should be quite stable even if the sheet doesn't get updated once
 * However, there is no handler for when the sheet hasn't been updated > once but that's a risk I'm willing to take and trust that the leads won't let that happen
 * As it stands, I'm just hoping it holds up until I finally get yagi automated and not rely on human input from the sheet
 * @param worldBoss - world boss data object from spreadsheet
 * @param serverTime - current server time
 * TODO: Add type for validated world boss data
 */
export const validateWorldBossData = (worldBoss: WorldBossData, serverTime: number) => {
  //Gets current day, month and year of server time
  const currentDay = format(serverTime, 'd');
  const currentMonth = format(serverTime, 'MMMM');
  const currentYear = format(serverTime, 'yyyy');

  /**
   * Tentative nextSpawn date
   * Takes the above variables and assumes the next spawn date is at the same date
   * Example:
   * Server Time = July 17, 2021 10:40:00 AM
   * nextSpawnDate = July 17, 2021 {{whatever time from sheet}}
   **/
  const nextSpawnDate = new Date(
    `${currentMonth} ${currentDay} ${currentYear} ${worldBoss.nextSpawn}`
  );
  let actualSpawnDate: string;

  //Cut-off time variables of current day
  const twelveAMStart = startOfDay(serverTime);
  const fourAM = addHours(twelveAMStart, 4);
  const eightPM = addHours(twelveAMStart, 20);
  const twelveAMEnd = endOfDay(serverTime);

  /**
   * See the difference in milliseconds between the next spawn date and server time
   * Positive means that next spawn date happens after the server time
   * Negative means that next spawn date happens before the server time
   **/
  const countdownValidity = differenceInMilliseconds(nextSpawnDate, serverTime);

  //Checks if nextSpawnDate is later than the current server time
  if (countdownValidity >= 0) {
    //If it is later, checks if it's spawning within 4 hours as time between world boss spawns should only be 4 hours
    if (countdownValidity <= 14400000) {
      /**
       * Normal timer for the full day
       * If we have the full timestamp the function stops here but we can't have everything in life
       **/
      actualSpawnDate = format(nextSpawnDate, 'MMMM d yyyy h:mm:ss a');
      return {
        serverTime: format(serverTime, 'MMMM d yyyy h:mm:ss a'),
        nextSpawn: actualSpawnDate,
        countdown: formatCountdown(nextSpawnDate, serverTime),
        accurate: true,
        location: worldBoss.location,
        lastSpawn: worldBoss.lastSpawn,
        projectedNextSpawn: format(addHours(new Date(actualSpawnDate), 4), 'MMMM d yyyy h:mm:ss a'),
      };
    } else {
      /**
       * If it's happening over 4 hours, this means that the tentative nextSpawnDate is wrong and ahead
       * This happens when the server time is in a new day and the sheet has not been updated yet i.e.:
       * Server time: July 18, 1:30:00 AM
       * Sheet next spawn data: 11:00:00 PM
       * Which makes our tentative next spawn date: July 18, 11:00:00 PM hence causes the countdown to be more than 4 hours
       * To fix this, we check if server time is in the early morning 12AM-4M and if the sheet data is from 8PM-12AM
       * If it is, we substract a day from nextSpawnDate and add 4 hours to it as well as for countdown
       */
      if (
        isWithinInterval(serverTime, { start: twelveAMStart, end: fourAM }) &&
        isWithinInterval(nextSpawnDate, { start: eightPM, end: twelveAMEnd })
      ) {
        actualSpawnDate = format(addHours(subDays(nextSpawnDate, 1), 4), 'MMMM d yyyy h:mm:ss a');
        return {
          serverTime: format(serverTime, 'MMMM d yyyy h:mm:ss a'),
          nextSpawn: actualSpawnDate,
          countdown: formatCountdown(addHours(subDays(nextSpawnDate, 1), 4), serverTime),
          accurate: false,
          location: worldBoss.location,
          lastSpawn: worldBoss.lastSpawn,
          projectedNextSpawn: format(
            addHours(new Date(actualSpawnDate), 4),
            'MMMM d yyyy h:mm:ss a'
          ),
        };
      }
    }
  } else {
    /**
     * NextSpawnDate is happening before the server time
     * In this case, the sheet is updated but our tentative nextSpawnDate is wrong and way behind
     * This happens when the server time is still today but the actual next spawn is happening in a new day i.e.:
     * Server time: July 17, 11:00:00 PM
     * Sheet next spawn data: 1:30:00 AM
     * Which makes our tentative next spawn date: July 17, 1:30:00 AM hence causes the countdown to be way behind
     * To fix this, we check if server time is in the late night 8PM-12AM and if nextSpawnDate is in the morning
     * If it is, we add a day to nextSpawnDate as well as for countdown
     */
    if (
      isWithinInterval(serverTime, { start: eightPM, end: twelveAMEnd }) &&
      nextSpawnDate.toString().includes('AM')
    ) {
      actualSpawnDate = format(addDays(nextSpawnDate, 1), 'MMMM d yyyy h:mm:ss a');
      return {
        serverTime: format(serverTime, 'MMMM d yyyy hh:mm:ss a'),
        nextSpawn: actualSpawnDate,
        countdown: formatCountdown(addDays(nextSpawnDate, 1), serverTime),
        accurate: true,
        location: worldBoss.location,
        lastSpawn: worldBoss.lastSpawn,
        projectedNextSpawn: format(addHours(new Date(actualSpawnDate), 4), 'MMMM d yyyy h:mm:ss a'),
      };
    } else {
      /**
       * NextSpawnDate is happening before the server time
       * In this case, it's during 12AM-8PM and only due to leads not updating the sheet
       * We default +4 hours to previous nextSpawn data
       */
      actualSpawnDate = format(addHours(nextSpawnDate, 4), 'MMMM d yyyy h:mm:ss a');
      return {
        serverTime: format(serverTime, 'MMMM d yyyy hh:mm:ss a'),
        nextSpawn: actualSpawnDate,
        countdown: formatCountdown(addHours(nextSpawnDate, 4), serverTime),
        accurate: false,
        location: worldBoss.location,
        lastSpawn: worldBoss.lastSpawn,
        projectedNextSpawn: format(addHours(new Date(actualSpawnDate), 4), 'MMMM d yyyy h:mm:ss a'),
      };
    }
  }
};
//----------
/**
 * Function to send health status so that I can monitor how the timer and reminders are doing
 * Currently in it's state it just returns the raw sheet data, the validated data and the current server time
 * In the future, I'll probably add more stuff in here like server status, individual channel status, number of active reminders and so forth
 * @param channel - channel to send health logs in
 * @param {*} rawData - data from olympus spreadsheet
 * @param {*} trueData - validated world boss data
 */
export const sendHealthLog = (
  channel: TextChannel,
  rawData: WorldBossData,
  trueData: any,
  type: string
): void => {
  switch (type) {
    case 'timer':
      const embed = {
        title: 'Yagi | Health Log',
        description: 'Requested data from sheet',
        color: trueData.accurate ? 3066993 : 16776960,
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
        },
        fields: [
          {
            name: 'Server Time',
            value: `\`trueData.serverTime\``,
          },
          {
            name: 'Sheet Data',
            value: `• Next Spawn: \`${rawData.nextSpawn}\`\n• Countdown: \`${rawData.countdown}\``,
          },
          {
            name: 'True Data',
            value: `• Next Spawn: \`${trueData.nextSpawn}\`\n• Countdown: \`${trueData.countdown}\`\n• Projected: \`${trueData.projectedNextSpawn}\``,
          },
          {
            name: 'Accurate',
            value: trueData.accurate ? 'Yes' : 'No',
            inline: true,
          },
        ],
      };
      channel.send({ embeds: [embed] });
      break;
  }
};
