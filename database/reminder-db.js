const sqlite = require('sqlite3').verbose();

const createReminderTable = (database) => {
  database.serialize(() => {
    database.run('CREATE TABLE IF NOT EXISTS Reminder(uuid TEXT NOT NULL PRIMARY KEY, created_at DATE NOT NULL, enabled BOOLEAN NOT NULL, enabled_by TEXT, enabled_at DATE, disabled_by TEXT, disabled_at TEXT, type TEXT NOT NULL, role_id TEXT NOT NULL, channel_id TEXT NOT NULL, guild_id TEXT NOT NULL)');
  })
}

module.exports = {
  createReminderTable
}
