const sqlite = require('sqlite3').verbose();
/**
 * Creates Reminder Details table inside the Yagi Database
 * Gets called in the client.once('ready') hook
 * Primarily to keep track of the special message from yagi where users can react with to get the reminder role
 * @param database - yagi database
 */
const createReminderDetailsTable = (database) => {
  database.run(`CREATE TABLE IF NOT EXISTS Reminder_Details(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, requested_by TEXT NOT NULL, channel_id TEXT NOT NULL, guild_id TEXT NOT NULL, no_of_reactions INTEGER NOT NULL)`);
}
/**
 * Adds new reminder details message to Reminder Details table
 * Gets called only when sending the user the reminderDetails message
 * @param message - message data object
 * @param user - user who initially used command
 */
const insertNewReminderDetails = (message, user) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO Reminder_Details(uuid, created_at, requested_by, channel_id, guild_id, no_of_reactions) VALUES ($uuid, $created_at, $requested_by, $channel_id, $guild_id, $no_of_reactions)', {
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
const cacheExistingReminderDetails = (guilds, client) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);

  guilds.forEach(guild => {
    guild.channels.cache.forEach(channel => {
      database.each(`SELECT * FROM Reminder_Details WHERE channel_id = ${channel.id}`, async (error, detail) => {
        if(error){
          console.log(error);
        }
        if(detail){
          await channel.messages.fetch(detail.uuid);
        }
      })
    })
  })
}
module.exports = {
  createReminderDetailsTable,
  insertNewReminderDetails,
  cacheExistingReminderDetails
}
