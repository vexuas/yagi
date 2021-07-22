const sqlite = require('sqlite3').verbose();
const { generateUUID, disableReminderEmbed, enableReminderEmbed, reminderInstructions, reminderDetails, sendReminderTimerEmbed, getServerTime, editReminderTimerStatus } = require('../helpers');
const { sendReminderReactionMessage } = require('./reminder-reaction-message-db.js');
const { differenceInMilliseconds } = require('date-fns');

/**
 * Creates Reminder table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Contrary to the other tables, we don't need to populate existing data from Discord as this is our own
 * @param database - yagi database
 */
const createReminderTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS Reminder(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, enabled BOOLEAN NOT NULL, enabled_by TEXT, enabled_at DATE, disabled_by TEXT, disabled_at DATE, type TEXT NOT NULL, role_uuid TEXT, channel_id TEXT, guild_id TEXT, reaction_message_id TEXT, timer BLOB)');
}
/**
 * **REFACTOR: Make it more easily readable**
 * Function in charge of enabling reminders
 * Either updates an existing reminder when it's disabled or calls the insertNewReminder function if it's a brand new reminder
 * @param message - message data object; taken from the on('message') event hook
 */
const enableReminder = (message, client) => {
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
        message.channel.send({ embed });
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
                  sendReminderReactionMessage(database, message, client, reminder, role);
                  startIndividualReminder(database, reminder, role, client);
                } else {
                  createReminderRole(message, reminder, client);
                }
              })
            })
          } else {
            //Creates a new reminder if it doesn't exist
            insertNewReminder(message, client);
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
 const insertNewReminder = (message, client) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  const reminderUUID = generateUUID();
  database.serialize(() => {
    /**
     * Create new reminder and insert it into our database table
     */
    database.run('INSERT INTO Reminder(uuid, created_at, enabled, enabled_by, enabled_at, disabled_by, disabled_at, type, role_uuid, channel_id, guild_id, reaction_message_id, timer) VALUES ($uuid, $created_at, $enabled, $enabled_by, $enabled_at, $disabled_by, $disabled_at, $type, $role_uuid, $channel_id, $guild_id, $reaction_message_id, $timer)', {
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
      $guild_id: message.guild.id,
      $reaction_message_id: null,
      $timer: null
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
          database.get(`SELECT * FROM Reminder WHERE uuid = "${reminderUUID}"`, (error, reminder) => {
            if(error){
              console.log(error);
            }
            startIndividualReminder(database, reminder, role, client);
            sendReminderReactionMessage(database, message, client, reminder, role);
          })
        })
      } else {
        database.get(`SELECT * FROM Reminder WHERE uuid = "${reminderUUID}"`, (error, reminder) => {
          if(error){
            console.log(error);
          }
          createReminderRole(message, reminder, client);
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
            stopReminder(database, reminder);
            message.channel.send({ embed });
          })
        }
      } else {
        message.channel.send({ embed });
      }
    })
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
            sendReminderReactionMessage(database, message, client, reminder, role);
            startIndividualReminder(database, reminder, role, client);
          })
        }
      })
    })
  } catch(e){
    console.log(e);
  }
}
/**
 * Function in charge to send the correct embed message when a user uses the `remind` command
 * If there's an active reminder in the server, we send the reminder details embed
 * If there's none, we send the reminder instructions embed
 * More information on the helpers.js file
 * @param message - message data object
 */
const sendReminderInformation = (message, yagi) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM Reminder WHERE guild_id = ${message.guild.id} AND enabled = ${true}`, (error, enabledReminder) => {
    if(error){
      console.log(error)
    }
    if(enabledReminder){
      database.get(`SELECT * FROM Role WHERE uuid = "${enabledReminder.role_uuid}"`,(error, role) => {
        if(error){
          console.log(error);
        }
        if(role){
          database.get(`SELECT * FROM ReminderReactionMessage WHERE uuid = "${enabledReminder.reaction_message_id}"`, async (error, reactionMessage) => {
            if(error){
              console.log(error)
            }
            if(reactionMessage){
              const reactionChannel = await yagi.channels.fetch(reactionMessage.channel_id); //Fetches channel data from discord
              const reactionMessageInChannel = await reactionChannel.messages.fetch(reactionMessage.uuid); //Fetches message data from discord
              const embed = reminderDetails(enabledReminder.channel_id, role.role_id, reactionMessageInChannel.url);
              message.channel.send({ embed })
            }
          })
        }
      })
    } else {
      const embed = reminderInstructions();
      message.channel.send({ embed });
    }
  })
}
/**
 * Function to start the timers for each enabled reminder
 * With the nature of how goat spawns do not stay fixed, we need to be constantly requesting and updating our timer dates
 * This would require us to call this function and restart reminders every time we make a call to the wb spreadsheet
 * Once we do get the updated data, we clear any existing timers and then start a new timer with the current next spawn date
 * In the end we update the reminder with the new timer id so we know which one to clear in the next iteration;
 * @param client - yagi client; to get the discord channel to send reminders in
 */
const startReminders = (database, client) => {
  database.each(`SELECT * FROM Reminder WHERE enabled = ${true}`, (error, reminder) => {
    if(reminder){
      database.get(`SELECT * FROM Role WHERE uuid = "${reminder.role_uuid}"`, (error, role) => {
        if(reminder.timer){
          clearTimeout(reminder.timer);
        }
        startIndividualReminder(database, reminder, role, client);
      })
    }
  })
}
/**
 * Function to start a timer based on the difference between the date of wb next spawn and date of server time when this function is called
 * Starts with a parent timeout for the actual reminder which ping users roughly 10 minutes before the actual spawn
 * Note that with increasing number of reminders set per server it won't always be 10 minutes but would differ by a couple of seconds due to time of computation
 * Set it to 10 minutes and 1 second just for aesthetic so at least 1 server would have a perfect 10 minutes in their cooldown field
 * After the initial timeout has elapsed, a secondary timeout gets started. Once this timeout reaches zero, it edits the initial message to convey that world boss has started on a specific channel
 * After 20 minutes, we then delete the message to avoid cluttering of channel
 * Made this reusable as we want to start individual timers when a reminder gets enabled and not just when getting the timer data
 * @param database - yagi database
 * @param reminder - enabled reminder data object
 * @param role - role used to ping
 * @param client - yagi discord client
 */
 const startIndividualReminder = (database, reminder, role, client) => {
  database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, (error, timer) => {
    const timerCountdown = differenceInMilliseconds(timer.next_spawn, getServerTime());
    const reminderChannel = client.channels.cache.get(reminder.channel_id);
    //Only start timers if nextSpawn date is after current server time
    if(timerCountdown >= 601000) {
      console.log('Restarting Reminders');
      const reminderTimeout = setTimeout(async () => {
        const reminderTimerMessage = await sendReminderTimerEmbed(reminderChannel, role.role_id, timer);
        setTimeout(async () => {
          await editReminderTimerStatus(reminderTimerMessage, role.role_id, timer);//Edit timer message to display that world boss has started
          await reminderTimerMessage.delete({ timeout: 1800000 }); //Delete timer message after 20 minutes as world boss has ended (30 minutes after the parent timeout)
        }, 601000); //600000 - Fired 10 minutes after timer message is sent; during when world boss has started
      }, timerCountdown - 601000); //600000 - 10 minutes before world boss spawns 

      database.run(`UPDATE Reminder SET timer = ${reminderTimeout} WHERE uuid = "${reminder.uuid}"`, error => {
        if(error){
          console.log(error);
        }
      });
    }
  })
}
/**
 * Function to stop reminder timers when they get disabled
 * Clears the setTimeout object tied to the reminder and updated the database column back to null
 * @param database - yagi database
 * @param reminder - reminder that has been disabled
 */
const stopReminder = (database, reminder) => {
  clearTimeout(reminder.timer);
  database.run(`UPDATE Reminder SET timer = ${null} WHERE uuid = "${reminder.uuid}"`);
}
module.exports = {
  createReminderTable,
  insertNewReminder,
  enableReminder,
  disableReminder,
  sendReminderInformation,
  startReminders,
  stopReminder
}
