const sqlite = require('sqlite3').verbose();

const createReminderDetailsTable = (database) => {
  database.run(`CREATE TABLE IF NOT EXISTS Reminder_Details(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, requested_by TEXT NOT NULL, channel_id TEXT NOT NULL, guild_id TEXT NOT NULL, no_of_reactions INTEGER NOT NULL)`);
}

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
