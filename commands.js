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
  remind: require('./commands/reminder/remind'),
  // ----------
  // Dev Tools
  daylights: require('./commands/developer/daylights'),
  offset: require('./commands/developer/offset'),
  psa: require('./commands/developer/psa'),
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
  feedback: require('./commands/misc/feedback'),
  prefix: require('./commands/misc/prefix'),
  setprefix: require('./commands/misc/setprefix'),
  // ----------
};
