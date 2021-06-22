const Discord = require('discord.js');
const { defaultPrefix, token } = require('./config/yagi.json');
const commands = require('./commands');
const yagi = new Discord.Client();
const guildConfig = require('./config/guild.json');
const sqlite = require('sqlite3').verbose();
const { serverEmbed } = require('./helpers');
const { createGuildTable, insertNewGuild, deleteGuild } = require('./database/guild-db.js');

yagi.once('ready', () => {
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
  //Database stuff
  const yagiDatabase = createYagiDatabase();
  createGuildTable(yagiDatabase, yagi.guilds.cache, yagi);
});

const activitylist = [
  'info | bot information',
  'ping me for prefix!',
  'goats | Olympus wb',
  'help | command list',
  'Last update: 10/03/2021',
  'checkout Ama for eidolons!',
];

yagi.on('ready', () => {
  yagi.user.setActivity(activitylist[0]);
  //Sends to test bot channel in yagi's den
  const testChannel = yagi.channels.cache.get('582213795942891521');
  testChannel.send("I'm booting up! (◕ᴗ◕✿)");
  setInterval(() => {
    //Changes games activity every 2 minutes on random
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
});
// When invited to a server
yagi.on('guildCreate', (guild) => {
  insertNewGuild(guild);
  const embed = serverEmbed(yagi, guild, 'join');
  const serversChannel = yagi.channels.cache.get('614749682849021972');
  serversChannel.send({ embed });
  serversChannel.setTopic(`Servers: ${yagi.guilds.cache.size}`); //Removed users for now
});

// When kicked from a server
yagi.on('guildDelete', (guild) => {
  deleteGuild(guild);
  //Send updated data to yagi discord server
  const embed = serverEmbed(yagi, guild, 'leave');
  const serversChannel = yagi.channels.cache.get('614749682849021972');
  serversChannel.send({ embed });
  serversChannel.setTopic(`Servers: ${yagi.guilds.cache.size}`); //Removed users for now
});
yagi.on('message', async (message) => {
  if (message.author.bot) return; //Ignore messages made my yagi
  const logChannel = yagi.channels.cache.get('620621811142492172');
  let yagiPrefix;
  if (message.channel.type === 'dm' || message.channel.type === 'group') {
    yagiPrefix = defaultPrefix;
  } else if (message.channel.type === 'text') {
    yagiPrefix = guildConfig[message.guild.id].prefix;
  }
  //Ignores messages without a prefix
  try {
    message.mentions.users.forEach((user) => {
      //shows current prefix when @
      if (user === yagi.user) {
        return message.channel.send('My current prefix is ' + '`' + `${yagiPrefix}` + '`');
      }
    });

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
        }
      } else {
        await message.channel.send("I'm not sure what you meant by that! （・□・；）");
      }
    } else {
      return;
    }
  } catch (e) {
    console.log(e);
    logChannel.send(e.message);
  }
});
yagi.on('error', (error) => {
  const logChannel = yagi.channels.cache.get('620621811142492172');
  console.log(error);
  logChannel.send(error.message);
});

yagi.login(token);

//Creates Yagi Database under database folder
const createYagiDatabase = () => {
  let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  return db;
}
