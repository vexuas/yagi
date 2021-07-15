const sqlite = require('sqlite3').verbose();
/**
 * Creates Reminder Details table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Primarily to keep track of the special message from yagi where users can react with to get the reminder role
 * @param database - yagi database
 */
const createReminderReactionMessageTable = (database) => {
  database.run(`CREATE TABLE IF NOT EXISTS ReminderReactionMessage(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, requested_by TEXT NOT NULL, channel_id TEXT NOT NULL, guild_id TEXT NOT NULL, no_of_reactions INTEGER NOT NULL)`);
}
/**
 * Adds new reminder details message to Reminder Details table
 * Gets called only when sending the user the reminderDetails message
 * @param message - message data object
 * @param user - user who initially used command
 */
const insertNewReminderReactionMessage = (message, user) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO ReminderReactionMessage(uuid, created_at, requested_by, channel_id, guild_id, no_of_reactions) VALUES ($uuid, $created_at, $requested_by, $channel_id, $guild_id, $no_of_reactions)', {
    $uuid: message.id,
    $created_at: message.createdAt,
    $requested_by: user.id,
    $channel_id: message.channel.id,
    $guild_id: message.guild.id,
    $no_of_reactions: 0
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
 * @param {*} reaction 
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
module.exports = {
  createReminderReactionMessageTable,
  insertNewReminderReactionMessage,
  cacheExistingReminderReactionMessages,
  updateReminderReactionMessage
}
