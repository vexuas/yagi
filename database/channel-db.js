const sqlite = require('sqlite3').verbose();

/**
 * Creates Channel table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * @param database - yagi database
 * @param channels - channels that yagi is currently holding
 * @param client - yagi client
 */
const createChannelTable = (database, channels, client) => {
  database.serialize(() => { 
    //Creates Channel Table with the relevant columns if it does not exist
    database.run('CREATE TABLE IF NOT EXISTS Channel(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, created_at TEXT NOT NULL, guild_id TEXT NOT NULL, owner_id TEXT NULL)');
    
    //Populate Channel Table with existing channels
    channels.forEach(channel => {
      database.get(`SELECT * FROM Channel WHERE uuid = ${channel.id}`, (error, row) => {
        if(error){
          console.log(error);
        }
        //Only runs statement and insert into guild table if the guild hasn't been created yet
        if(!row){
          database.run('INSERT INTO Channel (uuid, name, type, created_at, guild_id, owner_id) VALUES ($uuid, $name, $type, $created_at, $guild_id, $owner_id)', {
            $uuid: channel.id,
            $name: channel.name,
            $type: channel.type,
            $created_at: channel.createdAt,
            $guild_id: channel.guild.id,
            $owner_id: channel.guild.ownerID
          }, err => {
            if(err){
              console.log(err);
            }
          })
        }
      })
    })
  })
}
/**
 * Adds new channel to Channel table
 * Called either when yagi is invited to a new guild
 * Or when a channel is newly created within a guild
 * @param channel - new channel
 */
const insertNewChannel = (channel) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO Channel (uuid, name, type, created_at, guild_id, owner_id) VALUES ($uuid, $name, $type, $created_at, $guild_id, $owner_id)', {
    $uuid: channel.id,
    $name: channel.name,
    $type: channel.type,
    $created_at: channel.createdAt,
    $guild_id: channel.guild.id,
    $owner_id: channel.guild.ownerID
  }, err => {
    if(err){
      console.log(err);
    }
  })
}
/**
 * Deletes channel from Channel table
 * Called either when yagi is removed from a guild
 * Or when a channel is deleted
 * @param channel - deleted channel
 */
const deleteChannel = (channel) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`DELETE FROM Channel WHERE uuid = ${channel.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
const deleteAllChannels = (guild) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.each(`SELECT * FROM Channel WHERE guild_id = ${guild.id}`, (error, row) => {
    if(error){
      console.log(error);
    }
    database.run(`DELETE FROM Channel WHERE uuid = ${row.uuid}`, err => {
      if(err){
        console.log(err);
      }
    })
  })
}

module.exports = { 
  createChannelTable,
  insertNewChannel,
  deleteChannel,
  deleteAllChannels
}
