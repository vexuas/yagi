const sqlite = require('sqlite3').verbose();
const { generateUUID, disableReminderEmbed, enableReminderEmbed } = require('../helpers');
const { createReminderRole } = require('./role-db');
/**
 * Creates Reminder table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Contrary to the other tables, we don't need to populate existing data from Discord as this is our own
 * @param database - yagi database
 */
const createReminderTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS Reminder(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, enabled BOOLEAN NOT NULL, enabled_by TEXT, enabled_at DATE, disabled_by TEXT, disabled_at DATE, type TEXT NOT NULL, role_uuid TEXT, channel_id TEXT, guild_id TEXT)');
}
/**
 * Adds new reminder to Reminder Table
 * After creating the reminder, the createReminderRole function gets called to create the role used by yagi to ping users
 * @param message - message data object; taken from the on('message') event hook
 */
const insertNewReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  const reminderUUID = generateUUID();
  database.serialize(() => {
    database.run('INSERT INTO Reminder(uuid, created_at, enabled, enabled_by, enabled_at, disabled_by, disabled_at, type, role_uuid, channel_id, guild_id) VALUES ($uuid, $created_at, $enabled, $enabled_by, $enabled_at, $disabled_by, $disabled_at, $type, $role_uuid, $channel_id, $guild_id)', {
      $uuid: reminderUUID,
      $created_at: new Date(),
      $enabled: true,
      $enabled_by: message.author.id,
      $enabled_at: new Date(),
      $disabled_by: null,
      $disabled_at: null,
      $type: 'channel',
      $role_uuid: null,
      $channel_id: message.channel.id,
      $guild_id: message.guild.id
    }, err => {
      if(err){
        console.log(err);
      }
      const embed = {
        title: "Reminder Enabled!",
        description: "I will notify you in this channel before world boss spawns!",
        color: 55296
      }
      message.channel.send({ embed });
    })
    createReminderRole(message.guild, reminderUUID);
  })
}
/**
 * Function in charge of enabling reminders
 * Either updates an existing reminder when it's disabled or calls the insertNewReminder function if it's a brand new reminder
 * @param message - message data object; taken from the on('message') event hook
 */
const enableReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => {
    database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND enabled = ${true}`, (error, enabledReminder) => {
      if(error){
        console.log(error);
      }

      if(enabledReminder){
        const embed = enableReminderEmbed(message, enabledReminder)
        message.channel.send({ embed })
      } else {
        database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, (error, reminder) => {
          if(error){
            console.log(error);
          }
          //Checks if it's an existing reminder
          if(reminder){
            /**
             * Additional call to the Role Table to check if the role associated with the reminder still exists and hasn't been deleted
             * If it does exist, we don't do anything and update the reminder to its enable state
             * If it has been deleted, we call the createReminderRole to create a new role and link it with the reminder before updating it to its enable state
             */
            database.serialize(() => {
              database.get(`SELECT * FROM Role WHERE uuid = "${reminder.role_uuid}"`, (err, role) => {
                if(err){
                  console.log(err);
                }
                if(!role){
                  createReminderRole(message.guild, reminder.uuid);
                }
              })
              //Updates the reminder to enabled with relevant data
              database.run(`UPDATE Reminder SET enabled = ${true}, enabled_by = "${message.author.id}", enabled_at = ${Date.now()} WHERE uuid = "${reminder.uuid}"`, err => {
                if(err){
                  console.log(err);
                }
                const embed = enableReminderEmbed(message, reminder)
                message.channel.send({ embed });
              })
            })
          } else {
            //Creates a new reminder if it doesn't exist
            insertNewReminder(message);
          }
        })
      }
    })
  })
}
/**
 * Function in charge of disabling reminders
 * Thought of either deleting the reminder or updating the enabled column when disabling
 * Former would be easier to implement and maintain
 * Latter would offer more flexibility with the data albeit more effort to implement
 * Decided to go with updating just for the flexibility
 * @param message - message data object; taken from the on('message') event hook
 */
const disableReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => {
    database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, (error, reminder) => {
      if(error){
        console.log(error);
      }
      const embed = disableReminderEmbed(message, reminder);
      //Checks if it's an existing reminder
      if(reminder){
        //If it is, checks if reminder is disabled
        if(reminder.enabled === 0){
          message.channel.send({ embed });
        } else {
          //Updates the reminder to disabled with relevant data
          database.run(`UPDATE Reminder SET enabled = ${false}, disabled_by = "${message.author.id}", disabled_at = ${Date.now()} WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, err => {
            if(err){
              console.log(err);
            }
            message.channel.send({ embed });
          })
        }
      } else {
        message.channel.send({ embed });
      }
    })
  })
}
module.exports = {
  createReminderTable,
  insertNewReminder,
  enableReminder,
  disableReminder
}
