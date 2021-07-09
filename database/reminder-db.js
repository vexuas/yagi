const sqlite = require('sqlite3').verbose();
const { generateUUID } = require('../helpers');

const createReminderTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS Reminder(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, enabled BOOLEAN NOT NULL, enabled_by TEXT, enabled_at DATE, disabled_by TEXT, disabled_at DATE, type TEXT NOT NULL, role_id TEXT, channel_id TEXT, guild_id TEXT)');
}
const insertNewReminder = (message) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);

  database.run('INSERT INTO Reminder(uuid, created_at, enabled, enabled_by, enabled_at, disabled_by, disabled_at, type, role_id, channel_id, guild_id) VALUES ($uuid, $created_at, $enabled, $enabled_by, $enabled_at, $disabled_by, $disabled_at, $type, $role_id, $channel_id, $guild_id)', {
    $uuid: generateUUID(),
    $created_at: new Date(),
    $enabled: true,
    $enabled_by: message.author.tag,
    $enabled_at: new Date(),
    $disabled_by: null,
    $disabled_at: null,
    $type: 'channel',
    $role_id: null,
    $channel_id: message.channel.id,
    $guild_id: message.guild.id
  })
  console.log('inserted');
}
const enableReminder = () => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
}
const disableReminder = (message, reminder) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);

  database.run(`UPDATE Reminder SET enabled = ${false}, disabled_by = "${message.author.tag}", disabled_at = ${Date.now()} WHERE guild_id = ${message.guild.id} AND channel_id = ${message.channel.id}`, err => {
    if(err){
      console.log(err);
    }
  })
}
module.exports = {
  createReminderTable,
  insertNewReminder,
  enableReminder,
  disableReminder
}
