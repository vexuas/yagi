/**
 * Command list of yagi
 * Yes I could just use fs and put them in a discord collection
 * But I rather have them written somewhere I can see and refer to easily
 * Putting them in a object inside the bot honestly just makes it confusing
 */

module.exports = {
  // Timer
  // ----------

  // Reminder
  // ----------
  // Miscellaneous
  info: require('./commands/misc/info'),
  release: require('./commands/misc/release'),
  invite: require('./commands/misc/invite'),
  sheets: require('./commands/misc/sheets'),
  loot: require('./commands/misc/loot'),
  website: require('./commands/misc/website'),
  contacts: require('./commands/misc/contacts')
  // ----------
};
