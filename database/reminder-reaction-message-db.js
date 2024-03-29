const Discord = require('discord.js');
const sqlite = require('sqlite3').verbose();
const { reminderReactionMessage, reminderDetails, disableReminderEmbedWhenReactionIsDeleted } = require('../helpers');
/**
 * Creates Reminder Details table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Primarily to keep track of the special message from yagi where users can react with to get the reminder role
 * @param database - yagi database
 */
const createReminderReactionMessageTable = (database) => {
  database.run(`CREATE TABLE IF NOT EXISTS ReminderReactionMessage(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, requested_by TEXT NOT NULL, channel_id TEXT NOT NULL, guild_id TEXT NOT NULL, reminder_id TEXT NOT NULL, no_of_reactions INTEGER NOT NULL)`);
}
/**
 * Adds new reminder details message to Reminder Details table
 * Gets called only when sending the user the reminderDetails message
 * @param message - message data object
 * @param user - user who initially used command
 */
const insertNewReminderReactionMessage = (message, user, reminder) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    database.run('INSERT INTO ReminderReactionMessage(uuid, created_at, requested_by, channel_id, guild_id, reminder_id, no_of_reactions) VALUES ($uuid, $created_at, $requested_by, $channel_id, $guild_id, $reminder_id, $no_of_reactions)', {
      $uuid: message.id,
      $created_at: message.createdAt,
      $requested_by: user.id,
      $channel_id: message.channel.id,
      $guild_id: message.guild.id,
      $reminder_id: reminder.uuid,
      $no_of_reactions: 0
    })
    database.run(`UPDATE Reminder SET reaction_message_id = "${message.id}" WHERE uuid = "${reminder.uuid}"`, error => {
      if(error){
        console.log(error)
      }
    })
  })
}
/**
 * Function to cache existing reminder detail messages in discordjs cache
 * This is important as the messageReaction event handlers only look out for cached messages
 * This means that messages before yagi boots up will not be watched out for
 * To go around this, this function iterates on every channel on each guild yagi is in and fetches the existing reminder detail messages from Discord
 * This function is called in the client.once('ready') hook to cache all the messages in the beginning
 * @param guilds - guilds that yagi is in
 * @param client - yagi client
 */
const cacheExistingReminderReactionMessages = (guilds) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    //Adding the creation of reminder reaction table here to make sure it gets called first before caching messages
    createReminderReactionMessageTable(database);

    /**
     * Keeping this loop in the off chance discord ever implements adding of role on behalf of users
     * Dream is to support multiple reaction messages but currently we are limited to just one
     **/
    guilds.forEach(guild => {
      guild.channels.cache.forEach(channel => {
        database.each(`SELECT * FROM ReminderReactionMessage WHERE channel_id = ${channel.id}`, async (error, detail) => {
          if(error){
            console.log(error);
          }
          if(detail){
            try {
              await channel.messages.fetch(detail.uuid);
            }
            catch(e){
              //Delete reminder reaction data if message has been deleted in discord
              database.serialize(() => {
                database.each(`SELECT * FROM Reminder WHERE reaction_message_id = ${detail.uuid}`, (error, reminder) => {
                  database.run(`UPDATE Reminder SET reaction_message_id = ${null} WHERE uuid = "${reminder.uuid}"`);
                })
                database.get(`SELECT * FROM Reminder WHERE reaction_message_id = ${detail.uuid}`, (error, reminder) => {
                  if(reminder){
                    database.get(`SELECT * FROM Role WHERE uuid = "${reminder.role_uuid}"`, (error, role) => {
                      database.each(`SELECT * FROM ReminderUser WHERE reminder_reaction_message_id = "${detail.uuid}"`, async (error, user) => {
                        const memberToRemove = await guild.members.fetch(user.user_id);
                        memberToRemove.roles.remove(role.role_id);
                        database.run(`DELETE FROM ReminderUser WHERE uuid = "${user.uuid}"`);
                      })
                    })
                  }
                })
                database.run(`DELETE FROM ReminderReactionMessage WHERE uuid = "${detail.uuid}"`);
              })
            }
          }
        })
      })
    })
  })
}
/**
 * Function to update the reaction message
 * Only updates the reaction count for now as I don't think there's anything else that's important
 * Substracts 1 from the count taken from discord since yagi by default also reacts to it and discord counts it
 * Additional checks to see if the reaction is :goat: and if it's not made by the bot so we only update the table when necessary
 * @param reaction - reaction data object
 */
const updateReminderReactionMessage = (reaction) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM ReminderReactionMessage WHERE uuid = "${reaction.message.id}"`, (error, detail) => {
    if(error){
      console.log(error);
    }
    if(detail && !reaction.me && reaction.emoji.identifier === "%F0%9F%90%90"){
      const newCount = reaction.count - 1;
      database.run(`UPDATE ReminderReactionMessage SET no_of_reactions = ${newCount} WHERE uuid = ${detail.uuid}`, error => {
        if(error){
          console.log(error);
        }
      })
    }
  })
}
/**
 * Function to check if the message being updated/edited is the reaction message
 * This is solely to know if someone deletes the embed of the reaction message
 * There's a lot of voodoo conditionals as there's no clear cut way of knowing if someone deleted the embed within a message
 * Thankfully as the reaction message only has one embed, we can check if the old message had an embed and if the new message has none
 * Also we only want to check if the message itself was written by the bots so we don't hook into random messages from users
 * As for why we want to delete the message, I feel that it's pointless to keep the reaction message if the embed itself with all the reminder details has been deleted
 * @param message - new updated message data object
 * @param oldMessage - old message data object
 */
const checkIfReminderReactionMessage = (message, oldMessage) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM ReminderReactionMessage WHERE uuid = "${message.id}"`, (error, reactionMessage) => {
    if(reactionMessage && message.content === '' && oldMessage.embeds.length === 1 && message.embeds.length === 0 && (message.author.id === "582202266828668998" || message.author.id === "518196430104428579")){
      message.delete();
    }
  })
}
/**
 * Function to run when a user deletes the reminder reaction message
 * As the reaction message is our source of truth of knowing which users want reminding, deleting it would require us to remove that data
 * @param message - deleted message data object
 * @param client - yagi client
 */
const deleteReminderReactionMessage = (message, client) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    database.get(`SELECT * FROM ReminderReactionMessage WHERE uuid = "${message.id}"`, (error, reactionMessage) => {
      if(reactionMessage){
        database.serialize(() => {
          //Get reminder
          database.get(`SELECT * FROM Reminder WHERE reaction_message_id = ${message.id}`, (error, reminder) => {
            //Get reminder role
            database.get(`SELECT * FROM Role WHERE uuid = "${reminder.role_uuid}"`, (error, role) => {
              //For each reminder user we want to remove the reminder role from them
              database.each(`SELECT * FROM ReminderUser WHERE reminder_reaction_message_id = "${message.id}"`, async (error, user) => {
                if(role){
                  const memberToRemove = await message.guild.members.fetch(user.user_id);
                  memberToRemove.roles.remove(role.role_id);
                }
                database.run(`DELETE FROM ReminderUser WHERE uuid = "${user.uuid}"`); //Deletes the reminder user
              })
            })
          })
          /**
           * To prevent complications, it's best to stop any active reminders when the reminder reaction is deleted
           * We clear any timeouts that are active, send a special embed message and then update the reminder to be disabled
           */
          database.get(`SELECT * FROM Reminder WHERE reaction_message_id = "${message.id}" AND enabled = ${true}`, async (error, reminder) => {
            if(reminder){
              if(reminder.timer){
                clearTimeout(reminder.timer);
              }
              const embed = disableReminderEmbedWhenReactionIsDeleted();
              const channelToSend = await client.channels.fetch(reminder.channel_id);
              channelToSend.send({ embed });
              database.run(`UPDATE Reminder SET timer = ${null}, enabled = ${false} WHERE uuid = "${reminder.uuid}"`);
            }
          })
          //Update every reminder with the associated deleted reaction message as null
          database.each(`SELECT * FROM Reminder WHERE reaction_message_id = ${message.id}`, (error, reminder) => {
            database.run(`UPDATE Reminder SET reaction_message_id = ${null} WHERE uuid = "${reminder.uuid}"`);
          })
          //Delete the message from our database
          database.run(`DELETE FROM ReminderReactionMessage WHERE uuid = "${message.id}"`);
        })
      }
    })
    
  })
}
/**
 * Function to either send the reminder information or sending the reminder reaction message
 * We need to check if there's already an existing reaction message due to discord's current api limitation of not being able to force user reactions and move specific messages
 * Due to this, we need to only have one reaction message per server and just link to the message url in subsequent reminder enables
 * @param database - yagi database
 * @param message - message data object
 * @param client - yagi client
 * @param reminder - reminder that's enabled
 * @param role - role being used to ping users
 */
const sendReminderReactionMessage = (database, message, client, reminder, role) => {
  database.get(`SELECT * FROM ReminderReactionMessage WHERE guild_id = "${message.guild.id}"`, async (error, reactionMessage) => {
    if(reactionMessage){
      /**
       * If a reaction message already exists in the current server, we don't want to create a new one
       * Instead we show the reminder details instead so that users can be redirected to the original reaction message
       * As new reminders have no reaction message by default, we update it with the reaction message in the end
       */
      const reactionChannel = await client.channels.fetch(reactionMessage.channel_id); //Fetches channel data from discord
      const reactionMessageInChannel = await reactionChannel.messages.fetch(reactionMessage.uuid); //Fetches message data from discord
      const updatedReactionMessage = reminderReactionMessage(reminder.channel_id, role.role_id);
      await reactionMessageInChannel.edit(new Discord.MessageEmbed(updatedReactionMessage));
      const embed = reminderDetails(reminder.channel_id, role.role_id, reactionMessageInChannel.url);
      database.run(`UPDATE Reminder SET reaction_message_id = "${reactionMessage.uuid}" WHERE uuid = "${reminder.uuid}"`, err => {
        message.channel.send({ embed });
      })
    } else {
      /**
       * We send our reminder reaction message only after a reminder gets enabled
       * This is to collect reactions that yagi will use to set the reminder role
       * Yagi reacts to the message by default after sending it so users won't have to find the reaction
       * * By design and discord's api limitation, there will only be one reminder reaction message per server. 
      */
      const embed = reminderReactionMessage(reminder.channel_id, role.role_id)
      const messageDetail = await message.channel.send({ embed });
      await messageDetail.react('%F0%9F%90%90'); //Bot reacts to the message with :goat:
      insertNewReminderReactionMessage(messageDetail, message.author, reminder);
    }
  })
}
module.exports = {
  createReminderReactionMessageTable,
  insertNewReminderReactionMessage,
  cacheExistingReminderReactionMessages,
  updateReminderReactionMessage,
  checkIfReminderReactionMessage,
  deleteReminderReactionMessage,
  sendReminderReactionMessage
}
