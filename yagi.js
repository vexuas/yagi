const Discord = require('discord.js');
const { defaultPrefix, token, bisoMixpanel, yagiMixpanel } = require('./config/yagi.json');
const commands = require('./commands');
const yagi = new Discord.Client();
const sqlite = require('sqlite3').verbose();
const Mixpanel = require('mixpanel');
const { sendGuildUpdateNotification, sendErrorLog, checkIfInDevelopment } = require('./helpers');
const { createGuildTable, insertNewGuild, deleteGuild, updateGuild, updateGuildMemberCount } = require('./database/guild-db.js');
const { createChannelTable, insertNewChannel, deleteChannel, deleteAllChannels, updateChannel } = require('./database/channel-db.js');
const { createRoleTable, insertNewRole, deleteRole, updateRole } = require('./database/role-db.js');
const { createReminderTable } = require('./database/reminder-db.js');
const { createReminderDetailsTable } = require('./database/reminder-details-db.js');
const { sendMixpanelEvent } = require('./analytics');

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
    const testChannel = yagi.channels.cache.get('582213795942891521');
    testChannel.send("I'm booting up! (◕ᴗ◕✿)"); //Sends to test bot channel in yagi's den
    console.log("I'm ready! (◕ᴗ◕✿)");
    /**
     * Displays people and guilds using yagi along with roles inside guilds
     */
    yagi.guilds.cache.forEach(guild => {
      guild.members.fetch(guild.ownerID).then(guildMember => {
        console.log(`Guild: ${guild.name} - ${guild.region} : ${guild.memberCount} : ${guildMember.user.tag}`)
      })
      guild.roles.cache.forEach(role => {
        guild.members.fetch().then(members => {
          console.log(`Role: ${role.name} : ${guild.name} : ${role.members.size} : ${role.hexColor}`);
        }) 
      })
      guild.members.fetch().then(members => {
        members.forEach(member => {
          console.log(`Member: ${member.user.username} : ${guild.name}`);
        })
      })
    })

    console.log(`Number of guilds: ${yagi.guilds.cache.size}`);
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
    createReminderDetailsTable(yagiDatabase);
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
    if(channel.type !== 'dm'){
      insertNewChannel(channel);
    }
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
    sendGuildUpdateNotification(yagi, guild, 'join');
  } catch(e){
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildDelete', (guild) => {
  try {
    deleteGuild(guild);
    deleteAllChannels(guild);
    sendGuildUpdateNotification(yagi, guild, 'leave');
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
//------
/**
 * Event handlers for when a role in a guild where yagi is in gets created, deleted and updated
 * A bit overkill to store these since all that's needed is the roles that are used for reminders but might as well just store everything
 * roleCreate - called when a role is created in a server
 * roleDelete - called when a role is deleted in a server
 * roleUpdate - called when updating details (e.g. name change, color change) in a server
 */
yagi.on('roleCreate', (role) => {
  try {
    insertNewRole(role);
  } catch(e){
    sendErrorLog(yagi, e)
  }
})
yagi.on('roleDelete', (role) => {
  try {
    deleteRole(role);
  } catch(e){
    sendErrorLog(yagi, e)
  }
})
yagi.on('roleUpdate', (_, newRole) => {
  try {
    updateRole(newRole);
  }
  catch(e){
    sendErrorLog(yagi, e)
  }
})
//------
/**
 * Event handlers for when a cached message gets reactions
 */
yagi.on('messageReactionAdd', (reaction, user) => {
  
  console.log(user.username);
  console.log(reaction.emoji.identifier);
  console.log(reaction.emoji.name);
  console.log(reaction.me);
})
//------
/**
 * Event handler for when a message is sent in a channel that yagi is in
 */
yagi.on('message', async (message) => {
  if (message.author.bot) return; //Ignore messages made by yagi
  //Let users know that they can only use this in channels; sends sent_from_dm data to mixpanel to see if there's adoption for private messaging
  if (message.channel.type === 'dm'){
    const guildDM = {
      id: 'sent_from_dm',
      name: 'Sent From DM'
    }
    message.channel.send('My bad! I only work in server channels ( ≧Д≦)');
    sendMixpanelEvent(message.author, message.channel, guildDM, '', mixpanel);
    return;
  }

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
          sendMixpanelEvent(message.author, message.channel, message.channel.guild, command, mixpanel); //Send tracking event to mixpanel
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
