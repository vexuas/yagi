const sqlite = require('sqlite3').verbose();

const createReminderUserTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS ReminderUser(uuid TEXT NOT NULL PRIMARY KEY, reacted_at DATE NOT NULL, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, reminder_detail_id TEXT NOT NULL)');
}

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
