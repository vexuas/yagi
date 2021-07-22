const sqlite = require('sqlite3').verbose();
const { generateUUID, reminderReactionMessage, sendReminderTimerEmbed, getServerTime, editReminderTimerStatus } = require('../helpers');
const { insertNewReminderReactionMessage } = require('./reminder-reaction-message-db');
const { differenceInMilliseconds } = require('date-fns');
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
 * @param message - message data object. Used to get current guild object needed to create a role
 * @param reminder - reminder to be linked with role
 */
const createReminderRole = async (message, reminder, client) => {
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
            /**
             * We send our reminder reaction message only after a reminder gets enabled
             * This is to collect reactions that yagi will use to set the reminder role
             * Yagi reacts to the message by default after sending it so users won't have to find the reaction
             * * By design and discord's api limitation, there will only be one reminder reaction message per server. 
             */
            const embed = reminderReactionMessage(reminder.channel_id, role.role_id);
            const messageDetail = await message.channel.send({ embed })
            await messageDetail.react('%F0%9F%90%90'); //Bot reacts to the message with :goat:
            insertNewReminderReactionMessage(messageDetail, message.author, reminder);
            startIndividualReminder(database, reminder, role, client);
          })
        }
      })
    })
  } catch(e){
    console.log(e);
  }
}
const startIndividualReminder = (database, reminder, role, client) => {
  database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, (error, timer) => {
    const timerCountdown = differenceInMilliseconds(timer.next_spawn, getServerTime());
    const reminderChannel = client.channels.cache.get(reminder.channel_id);
    //Only start timers if nextSpawn date is after current server time
    if(timerCountdown >= 600000) {
      console.log('Restarting Reminders');
      const reminderTimeout = setTimeout(async () => {
        const reminderTimerMessage = await sendReminderTimerEmbed(reminderChannel, role.role_id, timer);
        setTimeout(async () => {
          await editReminderTimerStatus(reminderTimerMessage, role.role_id, timer);//Edit timer message to display that world boss has started
          await reminderTimerMessage.delete({ timeout: 1200000 }); //Delete timer message after 20 minutes as world boss has ended
        }, 600000); //600000 - Fired 10 minutes after timer message is sent; during when world boss has started
      }, timerCountdown - 4320000 - 600000); //600000 - 10 minutes before world boss spawns 

      database.run(`UPDATE Reminder SET timer = ${reminderTimeout} WHERE uuid = "${reminder.uuid}"`, error => {
        if(error){
          console.log(error);
        }
      });
    }
  })
}
module.exports = {
  createRoleTable,
  insertNewRole,
  deleteRole,
  updateRole,
  createReminderRole,
  startIndividualReminder
}
