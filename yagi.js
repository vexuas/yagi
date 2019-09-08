const Discord = require('discord.js');
const { defaultPrefix, token } = require('./config/yagi.json');
const commands = require('./commands');
const fs = require('fs');
const yagi = new Discord.Client();
const guildConfig = require('./config/guild.json');
const { serverEmbed } = require('./helpers');
/**
 * TODO | By 31 August 2019 | 5 days
 * ---------------------------------
 * Add cooldown for commands to avoid spamming bot
 * Add ability to customize prefix ✔
 * Revamp timer and countdown ✔
 * Revamp contacts ✔
 * Remove legacy code ✔
 * Rethink the amount of use for mentions
 * Refactor info command to be an actual information hub
 * Add help command for command list
 * Make help command as a dm, info too?
 * Create a database
 * Rework how reminders work
 * Set up API
 * Have a drink with nami
 */

yagi.once('ready', () => {
  console.log("I'm ready! (◕ᴗ◕✿)");
  /**
   * Displays people and guilds using yagi
   */
  yagi.users.forEach(user => {
    console.log(user.username);
  });
  yagi.guilds.forEach(guild => {
    console.log(`${guild.name} - ${guild.region} : ${guild.memberCount}`);
  });
  console.log(`Number of users: ${yagi.users.size}\nNumber of guilds: ${yagi.guilds.size}`);
  //Saves guild data if it's not in file
  yagi.guilds.forEach(guild => {
    if (!guildConfig[guild.id]) {
      guildConfig[guild.id] = {
        name: guild.name,
        owner: guild.owner.user.tag,
        memberCount: guild.memberCount,
        region: guild.region,
        prefix: defaultPrefix
      };
      fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2));
    }
  });
  console.log(guildConfig);
});

const activitylist = [
  '+info for bot information',
  '+goats for Olympus wb',
  'Last update: 27/05/2019',
  'Eternia coming soon (๑•́ω•̀)',
  'checkout Ama for eidolons!'
];

yagi.on('ready', () => {
  yagi.user.setActivity(activitylist[0]);
  //Sends to test bot channel in yagi's den
  const testChannel = yagi.channels.get('582213795942891521');
  testChannel.send("I'm booting up! (◕ᴗ◕✿)");
  setInterval(() => {
    //Changes games activity every 2 minutes on random
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
});
// When invited to a server
yagi.on('guildCreate', guild => {
  guildConfig[guild.id] = {
    name: guild.name,
    owner: guild.owner.user.tag,
    memberCount: guild.memberCount,
    region: guild.region,
    prefix: defaultPrefix
  };
  fs.writeFile('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(err) {
    if (err) {
      return console.log(err);
    }
    //Send new guild info to yagi discord server
    const embed = serverEmbed(yagi, guild, 'join');
    const serversChannel = yagi.channels.get('614749682849021972');
    serversChannel.send({ embed });
    serversChannel.setTopic(`Servers: ${yagi.guilds.size} | Users: ${yagi.users.size}`);
  });
});

// When kicked from a server
yagi.on('guildDelete', guild => {
  delete guildConfig[guild.id];
  fs.writeFile('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(err) {
    if (err) {
      return console.log(err);
    }
    //Send updated data to yagi discord server
    const embed = serverEmbed(yagi, guild, 'leave');
    const serversChannel = yagi.channels.get('614749682849021972');
    serversChannel.send({ embed });
    serversChannel.setTopic(`Servers: ${yagi.guilds.size} | Users: ${yagi.users.size}`);
  });
});
yagi.on('message', message => {
  let yagiPrefix;
  if (message.channel.type === 'dm' || message.channel.type === 'group') {
    yagiPrefix = defaultPrefix;
  } else if (message.channel.type === 'text') {
    yagiPrefix = guildConfig[message.guild.id].prefix;
  }
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
        return message.channel.send("That command doesn't accept arguments （・□・；）");
      } else {
        return commands[command].execute(message, arguments, yagi, commands, yagiPrefix);
      }
    } else {
      return message.channel.send("I'm not sure what you meant by that! （・□・；）");
    }
  } else {
    return;
  }
});

yagi.login(token);
