/**
 * Command list of yagi
 * Yes I could just use fs and put them in a discord collection
 * But I rather have them written somewhere I can see and refer to easily
 * Putting them in a object inside the bot honestly just makes it confusing
 */

// Timer
// ----------

// Reminder
// ----------

// Miscellaneous
// ----------
const info = require('./commands/info');
const release = require('./commands/release');

module.exports = {
  info: info,
  release: release
};
