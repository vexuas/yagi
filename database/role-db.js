const sqlite = require('sqlite3').verbose();
const { generateUUID } = require('../helpers');
/**
 * Creates Role table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * @param database - yagi database
 * @param guilds - guilds that yagi is in; using this as roles are nested inside the guild collection
 * @param client - yagi client
 */
const createRoleTable = async (database, guilds) => {
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
/**
 * Adds new role to Role Table
 * @param role - newly role created
 */
const insertNewRole = (role) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO Role (uuid, role_id, name, created_at, member_count, color, guild_id, used_for_reminder, reminder_id) VALUES ($uuid, $role_id, $name, $created_at, $member_count, $color, $guild_id, $used_for_reminder, $reminder_id)', {
    $uuid: generateUUID(),
    $role_id: role.id,
    $name: role.name,
    $created_at: role.createdAt,
    $member_count: role.members.size,
    $color: role.hexColor,
    $guild_id: role.guild.id,
    $used_for_reminder: false,
    $reminder_id: null
  }, err => {
    if(err){
      console.log(err);
    }
  })
}
/**
 * Deletes role from Role table
 * @param role - role that has been deleted
 */
const deleteRole = (role, client) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    //Update reminders to not have a role if the deleted role is being used in a reminder
    database.get(`SELECT * FROM Role WHERE role_id = ${role.id} AND guild_id = ${role.guild.id}`, (error, deletedRole) => {
      if(deletedRole.used_for_reminder === 1){
        database.serialize(() => {
          database.each(`SELECT * FROM Reminder WHERE role_uuid = "${deletedRole.uuid}"`, (error, reminder) => {
            if(reminder){
              database.run(`UPDATE Reminder SET role_uuid = ${null} WHERE uuid = "${reminder.uuid}"`);
            }
          })
          database.run(`DELETE FROM ReminderUser WHERE guild_id = "${deletedRole.guild_id}"`);
          database.get(`SELECT * FROM ReminderReactionMessage WHERE guild_id = "${deletedRole.guild_id}"`, async (error, reactionMessage) => {
            const channel = await client.channels.fetch(reactionMessage.channel_id);
            const message = await channel.messages.fetch(reactionMessage.uuid);
            message.reactions.cache.forEach(async reaction => {
              if(reaction.emoji.name === '🐐'){
                await reaction.remove();
              }
            })
          })
        })
      }
    })
    database.run(`DELETE FROM Role WHERE role_id = ${role.id} AND guild_id = ${role.guild.id}`, err => {
      if(err){
        console.log(err);
      }
    })
  })
}
/**
 * Updates data of existing role with new details in database
 * Only setting name and color as these are the only parameters we're saving in our database that can be edited by a user
 * @param role - new updated details of role 
 */
const updateRole = (role) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`UPDATE Role SET name = "${role.name}", color = "${role.hexColor}" WHERE role_id = ${role.id} AND guild_id = ${role.guild.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
module.exports = {
  createRoleTable,
  insertNewRole,
  deleteRole,
  updateRole
}
