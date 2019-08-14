const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const commands = require('./commands');

const yagi = new Discord.Client();

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
  const channel = yagi.channels.get('582213795942891521');
  channel.send("I'm booting up! (◕ᴗ◕✿)");
  setInterval(() => {
    //Changes games activity every 2 minutes on random
    const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
    yagi.user.setActivity(activitylist[index]);
  }, 120000);
});

yagi.login(token);

yagi.on('message', message => {
  //Ignores messages without a prefix
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(); //takes off prefix and returns message as an array
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
