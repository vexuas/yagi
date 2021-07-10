const sqlite = require('sqlite3').verbose();
const { generateUUID } = require('../helpers');
/**
 * Creates Reminder table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Contrary to the other tables, we don't need to populate existing data from Discord as this is our own
 * @param database - yagi database
 */
const createReminderTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS Reminder(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, enabled BOOLEAN NOT NULL, enabled_by TEXT, enabled_at DATE, disabled_by TEXT, disabled_at DATE, type TEXT NOT NULL, role_id TEXT, channel_id TEXT, guild_id TEXT)');
}
/**
 * Adds new reminder to Reminder Table
 * @param message - message data object; taken from the on('message') event hook
 */
const insertNewReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);

  database.run('INSERT INTO Reminder(uuid, created_at, enabled, enabled_by, enabled_at, disabled_by, disabled_at, type, role_id, channel_id, guild_id) VALUES ($uuid, $created_at, $enabled, $enabled_by, $enabled_at, $disabled_by, $disabled_at, $type, $role_id, $channel_id, $guild_id)', {
    $uuid: generateUUID(),
    $created_at: new Date(),
    $enabled: true,
    $enabled_by: message.author.id,
    $enabled_at: new Date(),
    $disabled_by: null,
    $disabled_at: null,
    $type: 'channel',
    $role_id: null,
    $channel_id: message.channel.id,
    $guild_id: message.guild.id
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
    database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, (error, row) => {
      if(error){
        console.log(error);
      }
      //Checks if it's an existing reminder
      if(row){
        //If it is, checks if the reminder is enabled
        if(row.enabled === 1){
          message.channel.send("Already enabled!");
        } else {
          //Updates the reminder to enabled with relevant data
          database.run(`UPDATE Reminder SET enabled = ${true}, enabled_by = "${message.author.id}", enabled_at = ${Date.now()} WHERE uuid = "${row.uuid}"`, err => {
            if(err){
              console.log(err);
            }
            message.channel.send('Reminder enabled!');
          })
        }
      } else {
        //Creates a new reminder if it doesn't exist
        insertNewReminder(message);
        message.channel.send('Reminder enabled!');
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
    database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, (error, row) => {
      if(error){
        console.log(error);
      }
      //Checks if it's an existing reminder
      if(row){
        //If it is, checks if reminder is disabled
        if(row.enabled === 0){
          message.channel.send('This channel does not have reminders enabled!');
        } else {
          //Updates the reminder to disabled with relevant data
          database.run(`UPDATE Reminder SET enabled = ${false}, disabled_by = "${message.author.id}", disabled_at = ${Date.now()} WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, err => {
            if(err){
              console.log(err);
            }
            message.channel.send('Reminder disabled!');
          })
        }
      } else {
        message.channel.send('This channel does not have reminders enabled!');
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
