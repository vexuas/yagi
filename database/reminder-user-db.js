const sqlite = require('sqlite3').verbose();

/**
 * Creates Reminder User table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * Primarily used to keep track of users who've reacted to the reaction message
 * @param database - yagi database
 */
const createReminderUserTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS ReminderUser(uuid TEXT NOT NULL PRIMARY KEY, reacted_at DATE NOT NULL, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, reminder_detail_id TEXT NOT NULL)');
}
/**
 * Function in charge on what to do when a user reacts to a message
 * First checks if the user who reacted exists in our database
 * If they aren't, we then check if the message they reacted to is a reminder reaction message before calling the insertNewReminderUser to add it to our table
 * Additional check to also see if the reaction was made by the bot or if the reaction is :goat: so we only update when necessary
 * @param reaction - reaction data object
 * @param user - user who made the reaction
 */
const reactToMessage = (reaction, user) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM ReminderUser WHERE uuid = "${user.id}"`, (error, reminderUser) => {
    if(error){
      console.log(error);
    }
    database.get(`SELECT * FROM ReminderReactionMessage WHERE uuid = "${reaction.message.id}"`, (error, reminderDetail) => {
      if(error){
        console.log(error);
      }
      if(reminderDetail && !reminderUser && !reaction.me && reaction.emoji.identifier === "%F0%9F%90%90"){
        insertNewReminderUser(reaction, user);
      }
    })
  })
}
/**
 * Adds new user to Reminder User table
 * Called after the user reacts to a reaction message with :goat:
 * Only need an Insert and not have an Update function as we don't really care about storing users in our database if they unreact to the message
 * @param reaction - reaction data object
 * @param user - user who made the reaction
 */
const insertNewReminderUser = (reaction, user) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    database.run(`INSERT INTO ReminderUser(uuid, reacted_at, guild_id, channel_id, reminder_detail_id) VALUES ($uuid, $reacted_at, $guild_id, $channel_id, $reminder_detail_id)`, {
      $uuid: user.id,
      $reacted_at: new Date(),
      $guild_id: reaction.message.guild.id,
      $channel_id: reaction.message.channel.id,
      $reminder_detail_id: reaction.message.id
    }, error => {
      if(error){
        console.log(error);
      }
    })
  })
}
/**
 * Deletes the user from Reminder User Table
 * @param user - user who unreacted
 */
const removeReminderUser = (user) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`DELETE FROM ReminderUser WHERE uuid = ${user.id}`, error => {
    if(error){
      console.log(error);
    }
  })
}

module.exports = {
  createReminderUserTable,
  reactToMessage,
  removeReminderUser
}
