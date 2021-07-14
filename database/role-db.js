const sqlite = require('sqlite3').verbose();
const { generateUUID, reminderReactionMessage } = require('../helpers');
const { insertNewReminderReactionMessage } = require('./reminder-reaction-message-db');
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
 * Deletes crole from Role table
 * @param role - role that has been deleted
 */
const deleteRole = (role) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`DELETE FROM Role WHERE role_id = ${role.id} AND guild_id = ${role.guild.id}`, err => {
    if(err){
      console.log(err);
    }
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
/**
 * Create role to be used by yagi for reminders
 * Uses update instead of inserting new row in table as the roleCreate event when creating a the new role
 * To prevent duplicate roles from being inserted into the table, we update the created role from the insertNewRole function with the relevant data
 * @param guild - current guild object; needed to create a role
 * @param reminderID - reminder id
 */
const createReminderRole = async (message, reminder) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  try {
    const reminderRole = await message.guild.roles.create({
      data: {
        name: 'Goat Hunters',
        color: '#68d5e9'
      },
      reason: 'Role to be used by Yagi for automated reminders for Vulture Vale/Blizzard Berg World Boss'
    })
    database.serialize(() => {
      database.get(`SELECT * FROM Role WHERE role_id = ${reminderRole.id} AND guild_id = ${reminderRole.guild.id}`, (error, role) => {
        if(error){
          console.log(error);
        }
        if(role){
          //Update reminder role with relevant data
          database.run(`UPDATE Role SET reminder_id = "${reminder.uuid}", used_for_reminder = ${true} WHERE uuid = "${role.uuid}"`, err => {
            if(err){
              console.log(err);
            }
          })
          //Update Reminder with created role
          database.run(`UPDATE Reminder SET role_uuid = "${role.uuid}" where uuid = "${reminder.uuid}"`, async err => {
            if(err){
              console.log(err);
            }
            const embed = reminderReactionMessage(reminder.channel_id, role.role_id);
            const messageDetail = await message.channel.send({ embed })
            await messageDetail.react('%F0%9F%90%90'); //Bot reacts to the message with :goat:
            insertNewReminderReactionMessage(messageDetail, message.author);
          })
        }
      })
    })
  } catch(e){
    console.log(e);
  }
}
module.exports = {
  createRoleTable,
  insertNewRole,
  deleteRole,
  updateRole,
  createReminderRole
}
