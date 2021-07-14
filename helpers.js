/**
 * Any functions that aren't directly related to commands are here
 * This is just to improve readability
 * Don't really want to shove everything in its command file and make those messy
 */
const {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  subHours,
  subMinutes,
} = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const { currentOffset } = require('./config/offset.json');
const grvAcnt = '`';

//----------
const getServerTime = function formatsLocalTimeToServerTimeUnformatted() {
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
//----------
/**
 * date-fns doesn't let you format distanceInWordsStrict yet
 * so can't return X hours, y mins, z seconds and can only get individually
 * This function tries to achieve this
 */
const formatCountdown = function formatCountdownUsingDifference(nextSpawnDate, serverTime) {
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
//----------
/**
 * Sheet only returns short version of location (v1, b2 etc)
 * I want to show full version and this achieves that
 */
const formatLocation = function formatRawLocationDataIntoFullMapAndChannel(rawLocation) {
  const prefixLocation = rawLocation.slice(0, 1).toLowerCase(); //Extracts the v/b in v1/b1
  const suffixLocation = rawLocation.slice(1, 2); //Extracts the 1/1 in v1/b1

  if (prefixLocation === 'v') {
    return `Vulture's Vale Ch.${suffixLocation} (X:161, Y:784)`;
  } else if (prefixLocation === 'b') {
    return `Blizzard Berg Ch.${suffixLocation} (X:264, Y:743)`;
  }
};
//----------
/**
 * Server Embed for when bot joining and leaving a server
 * Add iconURL logic to always return a png extension
 */
const serverEmbed = async function designOfEmbedForShowingYagiJoiningAndLeavingServer(
  yagi,
  guild,
  status
) {
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
  const embed = {
    title: embedTitle,
    description: `I'm now in **${yagi.guilds.cache.size}** servers!`, //Removed users for now
    color: embedColor,
    thumbnail: {
      url: guild.icon ? guild.iconURL().replace(/jpeg|jpg/gi, 'png') : defaultIcon,
    },
    fields: [
      {
        name: 'Name',
        value: guild.name
      },
      {
        name: 'Owner',
        value: await guild.members.fetch(guild.ownerID).then(guildMember => guildMember.user.tag),
        inline: true
      },
      {
        name: 'Members',
        value: guild.memberCount,
        inline: true
      },
      {
        name: 'Region',
        value: capitalize(guild.region),
        inline: true
      },
    ],
  };
  return embed;
};
//----------
/**
 * Description embed for help command
 */
const descriptionEmbed = function generatesDescriptionEmbedForCommands(
  command,
  description,
  currentPrefix,
  hasArguments,
  exampleArgument
) {
  const commandName = `${grvAcnt}${currentPrefix}${command}${grvAcnt}`;
  const argumentUsage = `${grvAcnt}${currentPrefix}${command} ${exampleArgument}${grvAcnt}`;

  const embed = {
    color: 32896,
    fields: [
      {
        name: commandName,
        value: description,
      },
      {
        name: 'Usage',
        value: hasArguments ? `${commandName} | ${argumentUsage}` : commandName,
      },
    ],
  };
  return embed;
};
//----------
/**
 * Formats first letter of string to uppercase
 */
const capitalize = function formatsFirstCharacterOfStringToUpperCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
//----------
/**
 * As I use Bisolen for development and testing of new features, it is a bit annoying to clear testing notifications from channels that yagi stores data in
 * This comes from hardcoding channels to log data in the event handlers. 
 * To avoid dirtying the data and cluttering production channels, this function determines if the client is Bisolen and is being used for development
 * Bisolen ID - 582202266828668998
 * Yagi ID - 518196430104428579
 */
 const checkIfInDevelopment = (client) => {
   return client.user.id === '582202266828668998'; //Bisolen's id (Development Bot)
}
//----------
/**
 * Sends a notification embed message to a specific channel
 * 582213795942891521: bot-development channel for Bisolen development
 * 614749682849021972: goat-servers channel for Yagi real guild data tracker
 * @param client - initialising discord client
 * @param guild  - guild data
 */
const sendGuildUpdateNotification = async (client, guild, type) => {
  const embed = await serverEmbed(client, guild, type);
  const channelId = checkIfInDevelopment(client) ? '582213795942891521' : '614749682849021972';
  const channelToSend = client.channels.cache.get(channelId);
  
  channelToSend.send({ embed });
  if(!checkIfInDevelopment(client)){
    channelToSend.setTopic(`Servers: ${client.guilds.cache.size}`);
  }
}
//----------
/**
 * Sends an error log to a specific channel for better error management
 * 620621811142492172: goat-logs channel in Yagi's Den
 * @param client - initialising discord client
 * @param error - error object
 */
const sendErrorLog = (client, error) => {
  console.log(error);
  const logChannel = client.channels.cache.get('620621811142492172');
  logChannel.send(error.message);
}
//----------
/**
 * UUID randomize generator
 */
const generateUUID = () => {
  return uuidv4();
}
//----------
/**
 * Embed design used when disabling reminders
 * First checks if message was sent in the reminder-enabled channel and if reminder even exists
 * If it does, we check if it the reminder is enabled and send an embed notifying the reminder has been disabled
 * If it's not sent in the enabled channel or if reminder doesn't exist, we send an embed notifying user that there are no active reminders in the channel
 * @param message - message data object
 * @param reminder - reminder to be disabled 
 */
const disableReminderEmbed = (message, reminder) => {
  let embed;
  const sentInEnabledChannel = reminder ? message.channel.id === reminder.channel_id : null;
  if(sentInEnabledChannel && reminder.enabled === 1){
    embed = {
      title: "Reminder disabled!",
      description: "I will no longer notify you in this channel",
      color: 16711680
    }
  } else {
    embed = {
      title: "Whoops!",
      description: "There are no active reminders in this channel",
      color: 32896
    }
  }
  return embed;
}
/**
 * Embed design used when enabling reminders
 * First checks if message was sent in the reminder-enabled channel and if reminder even exists
 * If it does, we check if it the reminder is disabled and send an embed notifying the reminder has been enabled
 * If it's not sent in the enabled channel or if reminder doesn't exist, we send an embed notifying user that there are no active reminders in the channel
 * @param message - message data object
 * @param reminder - reminder to be disabled  
 */
const enableReminderEmbed = (message, reminder) => {
  let embed;
  const sentInEnabledChannel = reminder ? message.channel.id === reminder.channel_id : null;
  if(sentInEnabledChannel && reminder.enabled === 0) {
    embed = {
      title: "Reminder Enabled!",
      description: "I will notify you in this channel before world boss spawns!",
      color: 55296
    }
  } else {
    embed = {
      title: "Whoops!",
      description: "There is already an active reminder in this server! To see the reminder details, type `$yagi-remind`",
      color: 32896
    }
  }
  return embed;
}
//----------
/**
 * Embed design used for onboarding users on how to use reminders
 * Tried to be as detailed as possible but still not sure if it would be complicated for users to get it
 * Debating if I have to do a support doc or make a video about it
 */
const reminderInstructions = () => {
  const embed = {
    description: "Personal reminder to notify you when world boss is spawning soon.\nCan only be activated in one channel per server by an admin.\n\n",
    color: 32896,
    thumbnail: {
      url:
        'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png'
    },
    fields: [
      {
        name: "How to enable:",
        value: "1. In the channel you want to get notifications from, type `$yagi-remind enable`. This will activate reminders on the current channel.\n2. When a channel is successfully activated, a special message is sent to the channel with details about the reminder."
      },
      {
        name: "How to use",
        value: "1. When a channel is activated, Yagi creates a new role in the server `@Goat Hunters`\n2. To get reminders, simply react on the special message with :goat: and you will automatically get the role. *Note that by removing the reaction you will lose the role*\n3. When world boss is spawning soon, Yagi will ping the role\n\n*To get the special message again, type `$yagi-remind`. You can also edit the role to customise its name/color*"
      },
      {
        name: "How to disable",
        value: "1. Type `$yagi-remind disable` in the channel where reminders was enabled. This will deactivate reminders on the current channel."
      }
    ]
  }
  return embed;
}
//----------
const reminderDetails = (channel, role) => {
  const embed = {
    title: "Reminder Details",
    color: 32896,
    description: "To get notified, react to the linked message below!",
    thumbnail: {
      url:
        'https://cdn.discordapp.com/attachments/248430185463021569/864309441821802557/goat-timer_logo_dark2_reminder.png'
    },
    fields: [
      {
        name: "Active Channel",
        value: `<#${channel}>`,
        inline: true
      },
      {
        name: "Reminder Role",
        value: `<@&${role}>`,
        inline: true
      },
      {
        name: "Reaction Message",
        value: 'Click me! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',

      }
    ]
  }
  return embed;
}
const reminderReactionMessage = (channel, role) => {
  const embed = {
    color: 32896,
    description: "To get notified, react to this message with :goat: and you will get the role!\n\n*Note that by removing the reaction you will lose the role*",
    thumbnail: {
      url:
        'https://cdn.discordapp.com/attachments/248430185463021569/864309441821802557/goat-timer_logo_dark2_reminder.png'
    },
    fields: [
      {
        name: "Active Channel",
        value: `<#${channel}>`,
        inline: true
      },
      {
        name: "Reminder Role",
        value: `<@&${role}>`,
        inline: true
      }
    ]
  }
  return embed;
}
//----------
module.exports = {
  getServerTime,
  formatCountdown,
  formatLocation,
  serverEmbed,
  descriptionEmbed,
  capitalize,
  checkIfInDevelopment,
  sendGuildUpdateNotification,
  sendErrorLog,
  generateUUID,
  disableReminderEmbed,
  enableReminderEmbed,
  reminderInstructions,
  reminderDetails,
  reminderReactionMessage
}
