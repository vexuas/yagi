const sqlite = require('sqlite3').verbose();
const { serverEmbed } = require('../helpers');

//Creates Yagi Database under database folder
const createYagiDatabase = () => {
  let db = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
  return db;
}
const createGuildTable = (database, guilds, client) => {
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => { 
    //Creates Guild Table with the relevant columns
    database.run('CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, region TEXT NOT NULL, owner_id TEXT NOT NULL)');
    
    //Populate Guild Table with existing guilds
    guilds.forEach(guild => {
      database.get(`SELECT * FROM Guild WHERE uuid = ${guild.id}`, (error, row) => {
        if(error){
          console.log(error);
        }
        if(!row){
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
            const embed = serverEmbed(client, guild, 'join');
            const serversChannel = client.channels.cache.get('614749682849021972');
            serversChannel.send({ embed });
            serversChannel.setTopic(`Servers: ${client.guilds.cache.size}`); //Removed users for now
          })
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

module.exports = {
  createYagiDatabase, 
  createGuildTable,
  insertNewGuild,
  deleteGuild
}
