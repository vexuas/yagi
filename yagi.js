const Discord = require('discord.js');
const { defaultPrefix, token } = require('./config/yagi.json');
const commands = require('./commands');
const fs = require('fs');
const yagi = new Discord.Client();
const guildConfig = require('./config/guild.json');
const { serverEmbed } = require('./helpers');
/**
 * TODO | By 31 August 2019 | (Almost a month late but got it out HAH)
 * ---------------------------------
 * Add cooldown for commands to avoid spamming bot ✖ (2.1.0)
 * Add ability to customize prefix ✔
 * Revamp timer and countdown ✔
 * Revamp contacts ✔
 * Remove legacy code ✔
 * Rethink the amount of use for mentions ✖ (It's fine as it is)
 * Refactor info command to be an actual information hub ✔
 * Add help command for command list ✔
 * Make help command as a dm, info too? ✖ (2.1.0? Don't see a problem with it atm unless we get bigger)
 * Create a database ✖ (somewhere in 2.0.0^ Too much hassle to do since we're only supporting 7 servers at most right now)
 * Rework how reminders work ✖ (2.0.0^ too probably, need an actual backend with this)
 * Set up API ✖ (2.0.0^ same as above)
 * Have a drink with nami ✔ (went out for some coffee)
 */

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
  console.log(`Number of guilds: ${yagi.guilds.size}`);
  //Saves guild data if it's not in file
  yagi.guilds.cache.forEach((guild) => {
    /**
     * IMPORTANT
     * It seems that the member and user collections are not accessible.
     * Not too sure how to fix for now, maybe updating discord.js to v12? Glancing through the release notes it looks like there would be a lot of breaking changes if I update
     * Either way, I'll remove all instances of them for now
     */
    if (!guildConfig[guild.id]) {
      guildConfig[guild.id] = {
        name: guild.name,
        // owner: guild.owner.user.tag,
        memberCount: guild.memberCount,
        region: guild.region,
        prefix: defaultPrefix,
      };
      fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2));
      const embed = serverEmbed(yagi, guild, 'join');
      const serversChannel = yagi.channels.cache.get('614749682849021972');
      serversChannel.send({ embed });
      serversChannel.setTopic(`Servers: ${yagi.guilds.size}`);
    }
  });
  console.log(guildConfig);
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
  guildConfig[guild.id] = {
    name: guild.name,
    // owner: guild.owner.user.tag,
    memberCount: guild.memberCount,
    region: guild.region,
    prefix: defaultPrefix,
  };
  fs.writeFile('./config/guild.json', JSON.stringify(guildConfig, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    //Send new guild info to yagi discord server
    const embed = serverEmbed(yagi, guild, 'join');
    const serversChannel = yagi.channels.cache.get('614749682849021972');
    serversChannel.send({ embed });
    serversChannel.setTopic(`Servers: ${yagi.guilds.size}`); //Removed users for now
  });
});

// When kicked from a server
yagi.on('guildDelete', (guild) => {
  delete guildConfig[guild.id];
  fs.writeFile('./config/guild.json', JSON.stringify(guildConfig, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    //Send updated data to yagi discord server
    const embed = serverEmbed(yagi, guild, 'leave');
    const serversChannel = yagi.channels.cache.get('614749682849021972');
    serversChannel.send({ embed });
    serversChannel.setTopic(`Servers: ${yagi.guilds.size}`); //Removed users for now
  });
});
yagi.on('message', async (message) => {
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
  const logChannel = yagi.channels.get('620621811142492172');
  console.log(error);
  logChannel.send(error.message);
});

yagi.login(token);
