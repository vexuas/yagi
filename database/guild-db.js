const sqlite = require('sqlite3').verbose();
const { serverEmbed } = require('../helpers');

/**
 * Creates Guild table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * @param database - yagi database
 * @param guilds - guilds that yagi is in
 * @param client - yagi client
 */
const createGuildTable = (database, guilds, client) => {
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => { 
    //Creates Guild Table with the relevant columns if it does not exist
    database.run('CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, region TEXT NOT NULL, owner_id TEXT NOT NULL)');
    
    //Populate Guild Table with existing guilds
    guilds.forEach(guild => {
      database.get(`SELECT * FROM Guild WHERE uuid = ${guild.id}`, (error, row) => {
        if(error){
          console.log(error);
        }
        //Only runs statement and insert into guild table if the guild hasn't been created yet
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
            //Sends info in guild server channel
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
/**
 * Adds new guild to Guild table
 * @param guild - guild that yagi is newly invited in
 */
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
/**
 * Deletes guild from Guild table
 * @param guild  - guild that yagi is removed in
 */
const deleteGuild = (guild) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`DELETE FROM Guild WHERE uuid = ${guild.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
/**
 * Updates data of existing guild with new details in database
 * Only setting name as that's the only parameter we're saving in our database that can be edited by a user
 * @param guild - new updated details of guild
 */
const updateGuild = (guild) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`UPDATE Guild SET name = "${guild.name}" WHERE uuid = ${guild.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
/**
 * Updates member count of guild when a new user joins the server
 * Function gets current member count of guild and adds 1 to it before updating
 * @param member = new member that's invited to guild
 */
const addGuildMemberCount = (member) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  let count = 1;
  database.get(`SELECT * FROM Guild WHERE uuid = ${member.guild.id}`, (error, row) => {
    if(error){
      console.log(error);
    }
    if(row){
      count += row.member_count //Adds 1 to current member count
      database.run(`UPDATE Guild SET member_count = ${count} WHERE uuid = ${row.uuid}`, err => {
        if(err){
          console.log(err)
        }
      })
    }
  })
}
const substractGuildMemberCount = (member) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  let count;
}
module.exports = { 
  createGuildTable,
  insertNewGuild,
  deleteGuild,
  updateGuild,
  addGuildMemberCount,
  substractGuildMemberCount
}
