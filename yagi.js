const Discord = require('discord.js');
const { token, bisoMixpanel, yagiMixpanel, topggToken, guildIDs } = require('./config/yagi.json');
const { getPrefixCommands, getApplicationCommands } = require('./commands');
const yagi = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
const sqlite = require('sqlite3').verbose();
const Mixpanel = require('mixpanel');
const {
  sendGuildUpdateNotification,
  sendErrorLog,
  checkIfInDevelopment,
  getWorldBossData,
  getServerTime,
  validateWorldBossData,
  sendHealthLog,
  isInWeeklyMaintenance,
  codeBlock,
} = require('./helpers');
const {
  createGuildTable,
  insertNewGuild,
  updateGuild,
  updateGuildMemberCount,
} = require('./database/guild-db.js');
const {
  createChannelTable,
  insertNewChannel,
  deleteChannel,
  updateChannel,
} = require('./database/channel-db.js');
const { createRoleTable, insertNewRole, deleteRole, updateRole } = require('./database/role-db.js');
const { createReminderTable } = require('./database/reminder-db.js');
const {
  cacheExistingReminderReactionMessages,
  updateReminderReactionMessage,
  deleteReminderReactionMessage,
  checkIfReminderReactionMessage,
} = require('./database/reminder-reaction-message-db.js');
const {
  createReminderUserTable,
  reactToMessage,
  removeReminderUser,
} = require('./database/reminder-user-db.js');
const { createTimerTable, getCurrentTimerData } = require('./database/timer-db.js');
const { sendMixpanelEvent } = require('./analytics');
const { AutoPoster } = require('topgg-autoposter');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(token);

const activitylist = [
  'info | bot information',
  'ping me for prefix!',
  'goats | Olympus wb',
  'help | command list',
  'remind | wb reminder notification',
  'setprefix | custom prefix',
  'v2.7.0 | 11/12/2021',
];
let mixpanel;

const commands = getPrefixCommands();
const appCommands = getApplicationCommands();
//----------
/**
 * Initialize yagi to log in and establish a connection to Discord
 * Wrapped in an async function as we want to wait for the promise to end so that our mixpanel instance knows which project to initialize in
 */
const initialize = async () => {
  await yagi.login(token);
  mixpanel = Mixpanel.init(checkIfInDevelopment(yagi) ? bisoMixpanel : yagiMixpanel);
  !checkIfInDevelopment(yagi) && AutoPoster(topggToken, yagi);
};
initialize();

/**
 * Event handler that fires only once when yagi is done booting up
 * Houses function initialisations such as database creation and activity list randomizer
 */
yagi.once('ready', async () => {
  try {
    await registerApplicationCommands(yagi);
    const testChannel = yagi.channels.cache.get('582213795942891521');
    testChannel.send("I'm booting up! (◕ᴗ◕✿)"); //Sends to test bot channel in yagi's den
    /**
     * Initial call to the Olympus spreadsheet and get world boss data
     * As the public sheet isn't accurate with the timestamps given (only returns time and not date), we validate the data first. See more info in the helpers file
     * After the data gets validated and is as accurate as possible now, we'll then be using this to store in our database
     */
    const worldBossData = await getWorldBossData();
    const serverTime = getServerTime();
    const validatedWorldBossData = validateWorldBossData(worldBossData, serverTime);
    /**
     * Initialise Database and its tables
     * Will create them if they don't exist
     * See relevant files under database/* for more information
     */
    const yagiDatabase = createYagiDatabase();
    createGuildTable(yagiDatabase, yagi.guilds.cache, yagi);
    createChannelTable(yagiDatabase, yagi.channels.cache, yagi);
    createRoleTable(yagiDatabase, yagi.guilds.cache);
    createReminderTable(yagiDatabase);
    cacheExistingReminderReactionMessages(yagi.guilds.cache); //creates reminder reaction table first -> cache messages after
    createReminderUserTable(yagiDatabase);
    createTimerTable(yagiDatabase, validatedWorldBossData, yagi); //timer table to store up-to-date world boss data; also used for reminders to work
    /**
     * Changes Yagi's activity every 2 minutes on random
     * Starts on the first index of the activityList array and then sets to a different one after
     */
    yagi.user.setActivity(activitylist[0]);
    setInterval(() => {
      const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
      yagi.user.setActivity(activitylist[index]);
    }, 120000);
    /**
     * Get current timer data from sheet every 30 minutes
     * We want to do this as goats spawn are not fixed hence we can't hardcode reminders with a set date
     * However, we don't want to spam requests on the sheet so we'll only ping if our current timer data on our end is either innacurate or the next spawn date has already passed
     * For more documentation, see the timer-db file
     */
    setInterval(
      () => {
        getCurrentTimerData(yagi);
      },
      1800000,
      yagi
    ); //1800000 - 30 minutes
    const healthChannel = yagi.channels.cache.get('866297328159686676'); //goat-health channel in Yagi's Den
    sendHealthLog(healthChannel, worldBossData, validatedWorldBossData, 'timer');
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
/**
 * Event handlers for when a channel is created, deleted and updated in servers where yagi is in
 * Used mainly for database updates to keep track of
 * channelCreate - called when new channel is created in a server yagi is in
 * channelDelete - called when channel is deleted in a server yagi is in
 * channelUpdate - called when updating details of a channel
 * More information about each function in their relevant database files
 */
yagi.on('channelCreate', (channel) => {
  try {
    if (channel.type !== 'dm') {
      insertNewChannel(channel);
    }
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('channelDelete', (channel) => {
  try {
    deleteChannel(channel);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('channelUpdate', (_, newChannel) => {
  try {
    updateChannel(newChannel);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
//------
/**
 * Event handlers for when yagi is invited to a new server, when he is kicked or when the guild he is in is updated
 * Sends notification to channel in Yagi's Den
 * guildCreate - called when yagi is invited to a server
 * guildDelete - called when yagi is kicked from server
 * guildUpdate - called when updating details (e.g name change) in server yagi is in
 * guildMemberAdd - called when a user gets invited to a server
 * guildMemberRemove - called when a user leaves a server
 * More information about each function in their relevant database files
 */
yagi.on('guildCreate', (guild) => {
  try {
    insertNewGuild(guild);
    guild.channels.cache.forEach((channel) => {
      insertNewChannel(channel);
    });
    sendGuildUpdateNotification(yagi, guild, 'join');
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildDelete', (guild) => {
  try {
    removeServerDataFromYagi(guild, yagi);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildUpdate', (_, newGuild) => {
  try {
    updateGuild(newGuild);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildMemberAdd', (member) => {
  try {
    updateGuildMemberCount(member, 'add');
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildMemberRemove', (member) => {
  try {
    updateGuildMemberCount(member, 'remove');
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
//------
/**
 * Event handlers for when a role in a guild where yagi is in gets created, deleted and updated
 * A bit overkill to store these since all that's needed is the roles that are used for reminders but might as well just store everything
 * roleCreate - called when a role is created in a server
 * roleDelete - called when a role is deleted in a server
 * roleUpdate - called when updating details (e.g. name change, color change) in a server
 * More information about each function in their relevant database files
 */
yagi.on('roleCreate', (role) => {
  try {
    insertNewRole(role);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('roleDelete', (role) => {
  try {
    deleteRole(role, yagi);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('roleUpdate', (_, newRole) => {
  try {
    updateRole(newRole);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
//------
/**
 * Event handlers for when a cached message gets reactions
 * messageReactionAdd - called when a user reacts to a message
 * messageReactionRemove - called when a user unreacts to a message
 * More information about each function in their relevant database files
 */
yagi.on('messageReactionAdd', async (reaction, user) => {
  updateReminderReactionMessage(reaction);
  reactToMessage(reaction, user);
});
yagi.on('messageReactionRemove', (reaction, user) => {
  updateReminderReactionMessage(reaction);
  removeReminderUser(reaction, user);
});
//------
/**
 * Event handlers for when message is updated and deleted
 * messageUpdate - called when a user edits a cached message
 * messageDelete - called when a user deletes a cached message
 * More information about each function in their relevant database files
 */
yagi.on('messageUpdate', (oldMessage, newMessage) => {
  checkIfReminderReactionMessage(newMessage, oldMessage);
});
yagi.on('messageDelete', (message) => {
  deleteReminderReactionMessage(message, yagi);
});
//------
/**
 * Event handler for when a message is sent in a channel that yagi is in
 */
yagi.on('messageCreate', async (message) => {
  if (message.author.bot) return; //Ignore messages made by yagi
  //Let users know that they can only use this in channels; sends sent_from_dm data to mixpanel to see if there's adoption for private messaging
  if (message.channel.type === 'dm') {
    const guildDM = {
      id: 'sent_from_dm',
      name: 'Sent From DM',
    };
    message.channel.send('My bad! I only work in server channels ( ≧Д≦)');
    sendMixpanelEvent(message.author, message.channel, guildDM, '', mixpanel);
    return;
  }
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);

  database.get(`SELECT * FROM Guild WHERE uuid = ${message.guild.id}`, async (error, row) => {
    if (error) {
      console.log(error);
    }
    /**
     * Opens the yagi database and finds the guild data where the message was used
     * This is primarily to know the current prefix of the guild; important when users are using a custom prefix
     */
    const yagiPrefix = row.prefix; //Wonder if we need to add a null check here and return the default prefix? Tho only ever applicable if somehow we mess up with the database interactions

    //Refactor this into its own function and pass as a callback for better readability in the future
    try {
      /**
       * Yagi checks if messages contains any mentions
       * If it does and if one of the mentions contains yagi's user, returns a message with the current prefix
       */
      message.mentions.users.forEach((user) => {
        //shows current prefix when @
        if (user === yagi.user) {
          return message.channel.send(
            'My current prefix is ' +
              '`' +
              `${yagiPrefix}` +
              '`' +
              '\nTo set a new custom prefix, type ' +
              ` ${codeBlock(`${yagiPrefix}setprefix`)}`
          );
        }
      });
      //Ignores messages without a prefix
      if (message.content.startsWith(yagiPrefix)) {
        const args = message.content.slice(yagiPrefix.length).split(' ', 1); //takes off prefix and returns first word as an array
        const command = args.shift().toLowerCase(); //gets command as a string from array
        const arguments = message.content.slice(yagiPrefix.length + command.length + 1); //gets arguments if there are any
        /**
         * If command exists in command file, send command reply
         * Also checks if command has arguments
         * Else send error message
         */
        if (commands[command]) {
          if (arguments.length > 0 && !commands[command].hasArguments) {
            await message.channel.send("That command doesn't accept arguments （・□・；）");
          } else {
            await commands[command].execute(message, arguments, yagi, commands, yagiPrefix); //Refactor to accept an object instead of passing in each argument
            sendMixpanelEvent(
              message.author,
              message.channel,
              message.channel.guild,
              command,
              mixpanel,
              arguments
            ); //Send tracking event to mixpanel
          }
        }
      } else {
        return;
      }
    } catch (e) {
      sendErrorLog(yagi, e);
    }
  });
});
yagi.on('error', (error) => {
  sendErrorLog(yagi, error);
});
yagi.on('interactionCreate', async (interaction) => {
  if (!interaction.inGuild()) return; //Only respond in server channels or if it's an actual command

  if (interaction.isCommand()) {
    const { commandName } = interaction;
    await appCommands[commandName].execute({ interaction });
  }
});
//Creates Yagi Database under database folder
const createYagiDatabase = () => {
  let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  return db;
};
/**
 * Function to delete all the relevant data in our database when yagi is removed from a server
 * Removes:
 * Guild
 * Channel
 * Role
 * ReminderUser
 * ReminderReactionMessage
 * Reminder
 * We clear any active reminders associated to the guild and then send the guild update notification to goat-servers in Yagi's Den
 * @param guild - guild in which yagi was kicked in
 */
const removeServerDataFromYagi = (guild) => {
  let database = new sqlite.Database(
    './database/yagi.db',
    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE
  );
  database.serialize(() => {
    database.run(`DELETE FROM Guild WHERE uuid = "${guild.id}"`);
    database.run(`DELETE FROM Channel WHERE guild_id = "${guild.id}"`);
    database.run(`DELETE FROM Role WHERE guild_id = "${guild.id}"`);
    database.run(`DELETE FROM ReminderUser WHERE guild_id = "${guild.id}"`);
    database.run(`DELETE FROM ReminderReactionMessage WHERE guild_id = "${guild.id}"`);
    database.each(`SELECT * FROM Reminder WHERE guild_id = "${guild.id}"`, (error, reminder) => {
      clearTimeout(reminder.timer);
      database.run(`DELETE FROM Reminder WHERE uuid = "${reminder.uuid}"`);
    });
    sendGuildUpdateNotification(yagi, guild, 'leave');
  });
};
/**
 * Function to register application commands
 * Application commands are different from regular prefix commands as instead of the bot directly responding to messages, discord would be the one doing it
 * In order to do that, we have to register the bot's application commands to discord first before it can be used
 * Two types of application commands:
 * - Guild Commands
 * - Global Commands
 * Basicailly guild commands can only be used in that server it was registered in
 * While global commands can be used to every server that bot is in
 * Main difference between the two apart from server constraints are that app commands are instantly registered in guilds while global would take up to an hour for changes to appear
 */
const registerApplicationCommands = async (yagi) => {
  const isInDevelopment = checkIfInDevelopment(yagi);
  const commandList = Object.keys(appCommands)
    .map((key) => appCommands[key].data)
    .filter((command) => command)
    .map((command) => command.toJSON());

  try {
    if (isInDevelopment) {
      await rest.put(Routes.applicationGuildCommands('929421200797626388', guildIDs), {
        body: commandList,
      });
      console.log('Successfully registered guild application commands');
    } else {
      //TODO: Add global register here
    }
  } catch (error) {
    console.log(error);
  }
};
