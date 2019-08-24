const Discord = require('discord.js');
const { defaultPrefix, token } = require('./config/yagi.json');
const commands = require('./commands');
const fs = require('fs');
const yagi = new Discord.Client();
const guildConfig = require('./config/guild.json');

/**
 * TODO | By 23 August 2019 | 3 days
 * ---------------------------------
 * Add cooldown for commands to avoid spamming bot
 * Add ability to customize prefix
 * Revamp timer and countdown ✔
 * Revamp contacts
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
      fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('Guild-config-json was updated!');
      });
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
  fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(err) {
    if (err) {
      return console.log(err);
    }
  });

  // Send new guild info to yagi discord server
  const serversChannel = yagi.channels.get('614749682849021972');
  serversChannel.send(`New server: ${guild.name} with ${guild.memberCount} users`);
});

// When kicked from a server
yagi.on('guildDelete', guild => {
  delete guildConfig[guild.id];
  fs.writeFileSync('./config/guild.json', JSON.stringify(guildConfig, null, 2), function(err) {
    if (err) {
      return console.log(err);
    }
  });

  // Send updated data to yagi discord server
  const serversChannel = yagi.channels.get('614749682849021972');
  serversChannel.send(`Left ${guild.name} with ${guild.memberCount} users`);
});
yagi.on('message', message => {
  const serverPrefix = guildConfig[message.guild.id].prefix;
  //Ignores messages without a prefix
  if (message.content.startsWith(serverPrefix)) {
    const args = message.content.slice(serverPrefix.length).split(); //takes off prefix and returns message as an array
    const command = args.shift().toLowerCase(); //gets command as a string from array

    /**
     * If command exists in command file, send command reply
     * Else send error message
     */
    if (commands[command]) {
      return commands[command].execute(message);
    } else {
      return message.channel.send("I'm not sure what you meant by that! （・□・；）");
    }
  } else {
    return;
  }
});

yagi.login(token);
