const sqlite = require('sqlite3').verbose();
const { generateUUID, disableReminderEmbed, enableReminderEmbed, reminderInstructions, reminderDetails, reminderReactionMessage } = require('../helpers');
const { createReminderRole } = require('./role-db');
const { insertNewReminderReactionMessage} = require('./reminder-reaction-message-db.js');
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
 * **REFACTOR: Make it more easily readable**
 * Function in charge of enabling reminders
 * Either updates an existing reminder when it's disabled or calls the insertNewReminder function if it's a brand new reminder
 * @param message - message data object; taken from the on('message') event hook
 */
const enableReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  //Wrapped in a serialize to ensure that each method is called in order which its initialised
  database.serialize(() => {
    /**
     * To lessen the amount of ping spam that might arise when enabling multiple channels within a guild to have reminders, I've decided to only limit the amount of active reminders to 1 at a time
     * Wrapped the enabling functions with an outer check of the database if there are any reminders that are active inside the server
     * If there is already, we send an embed notifying them there is already an active reminder
     * If there isn't, we then have an additional check to see if the channel they are in is already in our database
     * We update the data to its enabled state if it exists, create a new reminder in the database if it doesn't
     */
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
            database.serialize(async () => {
              //Updates the reminder to enabled with relevant data
              database.run(`UPDATE Reminder SET enabled = ${true}, enabled_by = "${message.author.id}", enabled_at = ${Date.now()} WHERE uuid = "${reminder.uuid}"`, err => {
                if(err){
                  console.log(err);
                }
                const embed = enableReminderEmbed(message, reminder)
                message.channel.send({ embed });
              })
              database.get(`SELECT * FROM Role WHERE uuid = "${reminder.role_uuid}"`, async (err, role) => {
                if(err){
                  console.log(err);
                }
                if(role){
                  const embed = reminderReactionMessage(reminder.channel_id, role.role_id);
                  const messageDetail = await message.channel.send({ embed })
                  await messageDetail.react('%F0%9F%90%90'); //Bot reacts to the message with :goat:
                  insertNewReminderReactionMessage(messageDetail, message.author);
                } else {
                  createReminderRole(message, reminder);
                }
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
 * Adds new reminder to Reminder Table
 * After creating the reminder, the createReminderRole function gets called to create the role used by yagi to ping users
 * @param message - message data object; taken from the on('message') event hook
 */
 const insertNewReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  const reminderUUID = generateUUID();
  database.serialize(() => {
    /**
     * Create new reminder and insert it into our database table
     */
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
      /**
       * Wrote an individual embed instead of using the function for better readability
       */
      const embed = {
        title: "Reminder Enabled!",
        description: "I will notify you in this channel before world boss spawns!",
        color: 55296
      }
      message.channel.send({ embed });
    })
    /**
     * After creation, we want to check if there's already an existing role inside the server that is specifically used for reminders i.e. made by yagi previously in another reminder channel
     * If there is, we update the new reminder to use the existing role
     * If there isn't, we create a new reminder role
     */
    database.get(`SELECT * FROM Role WHERE guild_id = ${message.guild.id} AND used_for_reminder = ${true}`, (error, role) => {
      if(error){
        console.log(error);
      }
      if(role){
        database.run(`UPDATE Reminder SET role_uuid = "${role.uuid}" WHERE uuid = "${reminderUUID}"`, error => {
          if(error){
            console.log(error);
          }
        })
      } else {
        database.get(`SELECT * FROM Reminder WHERE uuid = "${reminderUUID}"`, (error, reminder) => {
          if(error){
            console.log(error);
          }
          createReminderRole(message, reminder);
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
const sendReminderInformation = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND enabled = ${true}`, (error, enabledReminder) => {
    if(error){
      console.log(error)
    }
    if(enabledReminder){
      database.get(`SELECT * FROM Role WHERE uuid = "${enabledReminder.role_uuid}"`, async (error, role) => {
        if(error){
          console.log(error);
        }
        const embed = reminderDetails(enabledReminder.channel_id, role.role_id);
        message.channel.send({ embed })
       
      })
    } else {
      const embed = reminderInstructions();
      message.channel.send({ embed });
    }
  })
}
module.exports = {
  createReminderTable,
  insertNewReminder,
  enableReminder,
  disableReminder,
  sendReminderInformation
}
