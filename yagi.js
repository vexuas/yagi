const Discord = require('discord.js');
const { defaultPrefix, token, bisoMixpanel, yagiMixpanel } = require('./config/yagi.json');
const commands = require('./commands');
const yagi = new Discord.Client();
const sqlite = require('sqlite3').verbose();
const Mixpanel = require('mixpanel');
const { sendGuildUpdateNotification, sendErrorLog, checkIfInDevelopment } = require('./helpers');
const { createGuildTable, insertNewGuild, deleteGuild, updateGuild, updateGuildMemberCount } = require('./database/guild-db.js');
const { createChannelTable, insertNewChannel, deleteChannel, deleteAllChannels, updateChannel } = require('./database/channel-db.js');

const activitylist = [
  'info | bot information',
  'ping me for prefix!',
  'goats | Olympus wb',
  'help | command list',
  'Last update: 10/03/2021',
  'checkout Ama for eidolons!',
];
let mixpanel;
//----------
/**
 * Initialize yagi to log in and establish a connection to Discord
 * Wrapped in an async function as we want to wait for the promise to end so that our mixpanel instance knows which project to initialize in
 */
const initialize = async () => {
  await yagi.login(token);
  mixpanel = Mixpanel.init(checkIfInDevelopment(yagi) ? bisoMixpanel : yagiMixpanel);
}
initialize();
/**
 * Event handler that fires only once when yagi is done booting up
 * Houses function initialisations such as database creation and activity list randomizer
 */
yagi.once('ready', () => {
  try {
    mixpanel.track('')
    const testChannel = yagi.channels.cache.get('582213795942891521');
    testChannel.send("I'm booting up! (◕ᴗ◕✿)"); //Sends to test bot channel in yagi's den
    console.log("I'm ready! (◕ᴗ◕✿)");
    /**
     * Displays people and guilds using yagi
     */
    yagi.users.cache.forEach((user) => {
      console.log(user.username);
    });
    yagi.guilds.cache.forEach((guild) => {
      console.log(`${guild.name} - ${guild.region} : ${guild.memberCount}`);
    });
    console.log(`Number of guilds: ${yagi.guilds.cache.size}`);
    /**
     * Initialise Database and its tables
     * Will create them if they don't exist
     * See relevant files under database/* for more information
     */
    const yagiDatabase = createYagiDatabase();
    createGuildTable(yagiDatabase, yagi.guilds.cache, yagi);
    createChannelTable(yagiDatabase, yagi.channels.cache, yagi);
    /**
     * Changes Yagi's activity every 2 minutes on random
     * Starts on the first index of the activityList array and then sets to a different one after
     */
    yagi.user.setActivity(activitylist[0]);
    setInterval(() => {
      const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
      yagi.user.setActivity(activitylist[index]);
    }, 120000);
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
/**
 * Event handlers for when a channel is created, deleted and updated in servers where yagi is in
 * Used mainly for database updates to keep track of
 * channelCreate - called when new channel is created in a server yagi is in
 * channelDelete - called when channel is deleted in a server yagi is in
 * channelUpdate - called when updating details of a channel
 */
yagi.on('channelCreate', (channel) => {
  try {
    insertNewChannel(channel);
  } catch(e){
    sendErrorLog(yagi, e);
  }
})
yagi.on('channelDelete', (channel) => {
  try {
    deleteChannel(channel);
  } catch(e){
    sendErrorLog(yagi, e);
  }
})
yagi.on('channelUpdate', (_, newChannel) => {
  try {
    updateChannel(newChannel);
  } catch(e){
    sendErrorLog(yagi, e);
  }
})
//------
/**
 * Event handlers for when yagi is invited to a new server, when he is kicked or when the guild he is in is updated
 * Sends notification to channel in Yagi's Den
 * guildCreate - called when yagi is invited to a server
 * guildDelete - called when yagi is kicked from server
 * guildUpdate - called when updating details (e.g name change) in server yagi is in
 */
yagi.on('guildCreate', (guild) => {
  try {
    insertNewGuild(guild);
    guild.channels.cache.forEach(channel => {
      insertNewChannel(channel);
    })
    sendGuildUpdateNotification(yagi, guild);
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildDelete', (guild) => {
  try {
    deleteGuild(guild);
    deleteAllChannels(guild);
    sendGuildUpdateNotification(yagi, guild);
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildUpdate', (_, newGuild) => {
  try {
    updateGuild(newGuild);
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildMemberAdd', (member) => {
  try {
    updateGuildMemberCount(member, 'add');
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildMemberRemove', (member) => {
  try {
    updateGuildMemberCount(member, 'remove');
  } catch(e){
    sendErrorLog(yagi, e);
  }
})
//-----
/**
 * Event handler for when a message is sent in a channel that yagi is in
 */
yagi.on('message', async (message) => {
  if (message.author.bot) return; //Ignore messages made by yagi
  const yagiPrefix = defaultPrefix; //Keeping this way for now to remind myself to add a better way for custom prefixes

  try {
    /**
     * Yagi checks if messages contains any mentions
     * If it does and if one of the mentions contains yagi's user, returns a message with the current prefix
     */
    message.mentions.users.forEach((user) => {
      //shows current prefix when @
      if (user === yagi.user) {
        return message.channel.send('My current prefix is ' + '`' + `${yagiPrefix}` + '`' + '. For list of commands, type '+ '`' + `${yagiPrefix}help` + '`');
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
          await commands[command].execute(message, arguments, yagi, commands, yagiPrefix);
          sendMixpanelEvent(message.author, message.channel, message.channel.guild, command, mixpanel);
        }
      } else {
        await message.channel.send("I'm not sure what you meant by that! （・□・；）");
      }
    } else {
      return;
    }
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('error', (error) => {
  sendErrorLog(yagi, error);
});

//Creates Yagi Database under database folder
const createYagiDatabase = () => {
  let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  return db;
}
/**
 * Aparently the node js mixpanel library does not support identify and super properties as inherently it's not client-side and doesn't concern itself with what the user does
 * This doesn't go too well with my use case of wanting to track user interaction with the app
 * Fortunately there's a workaround but would require passing the properties for each event
 * Will implement in a new pr
 */
const sendMixpanelEvent = (user, channel, guild, command, client) => {
  const eventToSend = `Use ${command} command`;
  client.track(eventToSend, {
    distinct_id: user.id,
    user: user.tag,
    user_name: user.username,
    channel: channel.name,
    channel_id: channel.id,
    guild: guild.name,
    guild_id: guild.id
  })
  client.people.set(user.id, {
    $name: user.username,
    $created: user.createdAt.toISOString(),
    tag: user.tag,
    guild: guild.name,
    guild_id: guild.id
  })
}
