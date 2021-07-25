const sqlite = require('sqlite3').verbose();
const { sendGuildUpdateNotification} = require('../helpers');
const { defaultPrefix } = require('../config/yagi.json');

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
    database.run('CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, region TEXT NOT NULL, owner_id TEXT NOT NULL, prefix TEXT NOT NULL)');
    
    //Populate Guild Table with existing guilds
    guilds.forEach(guild => {
      database.get(`SELECT * FROM Guild WHERE uuid = ${guild.id}`, (error, row) => {
        if(error){
          console.log(error);
        }
        //Only runs statement and insert into guild table if the guild hasn't been created yet
        if(!row){
          database.run('INSERT INTO Guild (uuid, name, member_count, region, owner_id, prefix) VALUES ($uuid, $name, $member_count, $region, $owner_id, $prefix)', {
            $uuid: guild.id,
            $name: guild.name,
            $member_count: guild.memberCount,
            $region: guild.region,
            $owner_id: guild.ownerID,
            $prefix: defaultPrefix
          }, err => {
            if(err){
              console.log(err);
            }
            sendGuildUpdateNotification(client, guild, 'join');
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
  database.run('INSERT INTO Guild (uuid, name, member_count, region, owner_id, prefix) VALUES ($uuid, $name, $member_count, $region, $owner_id, $prefix)', {
    $uuid: guild.id,
    $name: guild.name,
    $member_count: guild.memberCount,
    $region: guild.region,
    $owner_id: guild.ownerID,
    $prefix: defaultPrefix
  }, err => {
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
 * Updates member count of guild whenever a user joins or leaves a server
 * Function gets current member count of guild first
 * Depending on the type, it either adds or substracts from the member count before updating the database row
 * @param member - member that joins/leaves
 * @param type - parameter to know if user joined or left
 */
const updateGuildMemberCount = (member, type) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  let count;
  database.get(`SELECT * FROM Guild WHERE uuid = ${member.guild.id}`, (error, row) => {
    if(error){
      console.log(error);
    }
    //Only run statement if row exists
    if(row){
      switch(type){
        case 'add':
          count = row.member_count + 1 //Adds 1 to current member count if type is add
          break;
        case 'remove':
          count = row.member_count - 1 //Substracts 1 to current member count if type is remove
          break;
      }
      database.run(`UPDATE Guild SET member_count = ${count} WHERE uuid = ${row.uuid}`, err => {
        if(err){
          console.log(err)
        }
      })
    }
  })
}
module.exports = { 
  createGuildTable,
  insertNewGuild,
  updateGuild,
  updateGuildMemberCount
}
