const sqlite = require('sqlite3').verbose();
const { generateUUID } = require('../helpers');
/**
 * Creates Role table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * @param database - yagi database
 * @param guilds - guilds that yagi is in; using this as roles are nested inside the guild collection
 * @param client - yagi client
 */
const createRoleTable = async (database, guilds, client) => {
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => {
    //Creates Role Table with the relevant columns if it does not exist
    database.run('CREATE TABLE IF NOT EXISTS Role(uuid TEXT NOT NULL PRIMARY KEY, role_id TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL, member_count INTEGER NOT NULL, color TEXT NOT NULL, guild_id TEXT NOT NULL, used_for_reminder BOOLEAN, reminder_id TEXT)');
    
    /**
     * Populate Role Table with existing roles for every guild
     * As role_id is only unique to the guild that it is in, there is a possiblity that one role from one guild would have the same id as another role in another guild
     * With this risk, we can't make role_id as the primary key and instead create a randomized uuid 
     **/ 
    guilds.forEach(guild => {
      guild.roles.cache.forEach(async role => {
        await guild.members.fetch();
        database.get(`SELECT * FROM Role WHERE role_id = ${role.id} AND guild_id = ${guild.id}`, (error, row) => {
          if(error){
            console.log(error);
          }
          if(!row){
            database.run('INSERT INTO Role (uuid, role_id, name, created_at, member_count, color, guild_id, used_for_reminder, reminder_id) VALUES ($uuid, $role_id, $name, $created_at, $member_count, $color, $guild_id, $used_for_reminder, $reminder_id)', {
              $uuid: generateUUID(),
              $role_id: role.id,
              $name: role.name,
              $created_at: role.createdAt,
              $member_count: role.members.size,
              $color: role.hexColor,
              $guild_id: guild.id,
              $used_for_reminder: false,
              $reminder_id: null
            }, err => {
              if(error){
                console.log(err);
              }
            })
          }
        })
      })
    })
  })
}

module.exports = {
  createRoleTable
}
