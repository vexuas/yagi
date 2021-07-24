const Discord = require('discord.js');
const sqlite = require('sqlite3').verbose();
const { reminderReactionMessage, reminderDetails } = require('../helpers');
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
            await channel.messages.fetch(detail.uuid);
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
  sendReminderReactionMessage
}
