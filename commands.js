/**
 * Command list of yagi
 * Yes I could just use fs and put them in a discord collection
 * But I rather have them written somewhere I can see and refer to easily
 * Putting them in a object inside the bot honestly just makes it confusing
 */

module.exports = {
  // Timer
  goats: require('./commands/timer/goats'),
  // ----------

  // Reminder
  // ----------
  // Dev Tools
  reply: require('./commands/developer/reply'),
  message: require('./commands/developer/message'),
  daylights: require('./commands/developer/daylights'),
  offset: require('./commands/developer/offset'),
  // Hub
  // ----------
  info: require('./commands/hub/info'),
  help: require('./commands/hub/help'),
  release: require('./commands/hub/release'),
  sheets: require('./commands/hub/sheets'),
  // ----------
  // Miscellaneous
  invite: require('./commands/misc/invite'),
  loot: require('./commands/misc/loot'),
  website: require('./commands/misc/website'),
  contacts: require('./commands/misc/contacts'),
  prefix: require('./commands/misc/prefix')
  // ----------
};
