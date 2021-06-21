const Discord = require('discord.js');
const { defaultPrefix, token } = require('./config/yagi.json');
const commands = require('./commands');
const fs = require('fs');
const yagi = new Discord.Client();
const guildConfig = require('./config/guild.json');
const sqlite = require('sqlite3').verbose();
const { serverEmbed } = require('./helpers');

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
  //Saves guild data if it's not in file
  yagi.guilds.cache.forEach((guild) => {
    console.log(guild);
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
      serversChannel.setTopic(`Servers: ${yagi.guilds.cache.size}`);
    }
  });
  console.log(guildConfig);
  //Database stuff
  const yagiDatabase = createYagiDatabase();
  createGuildTable(yagiDatabase, yagi.guilds.cache);
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
  if (message.author.bot) return;
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

      //Database stuff
      let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
    
      let userId = message.author.id;
      let uName = message.author.tag;
      if(command === 'getdata'){
        let query = `SELECT * FROM Guild where rowid = 1`;
        db.get(query, (err, row) => {
          if(err){
            console.log(err);
            return;
          }
          console.log(row);
        });
      }

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

//Creates Yagi Database under database folder
const createYagiDatabase = () => {
  let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  return db;
}
const createGuildTable = (database, guilds) => {
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => { 
    //Don't create the table if it already exists in the database
    database.run('DROP TABLE IF EXISTS Guild', error => {
      if(error){
        console.log(error);
      }
    })
    //Creates Guild Table with the relevant columns
    database.run('CREATE TABLE Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, region TEXT NOT NULL, owner_id TEXT NOT NULL)');
    
    //Populate Guild Table with existing guilds
    guilds.forEach(guild => {
      database.run('INSERT INTO Guild (uuid, name, member_count, region, owner_id) VALUES ($uuid, $name, $member_count, $region, $owner_id)', {
        $uuid: guild.id,
        $name: guild.name,
        $member_count: guild.memberCount,
        $region: guild.region,
        $owner_id: guild.ownerID
      }, err => {
        if(err){
          console.log(err);
        }
      })
    })
  })
}
const insertNewGuild = (guild) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO Guild (uuid, name, member_count, region, owner_id) VALUES ($uuid, $name, $member_count, $region, $owner_id)', {
    $uuid: guild.id,
    $name: guild.name,
    $member_count: guild.memberCount,
    $region: guild.region,
    $owner_id: guild.ownerID
  }, err => {
    if(err){
      console.log(err);
    }
  })
}
const deleteGuild = (guild) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`DELETE FROM Guild WHERE uuid = ${guild.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
