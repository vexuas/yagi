/**
 * Command list of yagi
 * Yes I could just use fs and put them in a discord collection
 * But I rather have them written somewhere I can see and refer to easily
 * Putting them in a object inside the bot honestly just makes it confusing
 */

exports.getPrefixCommands = () => {
  return {
    // Timer
    goats: require('./commands/timer/goats'),
    // ----------

    // Reminder
    remind: require('./commands/reminder/remind'),
    // ----------
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
    prefix: require('./commands/misc/prefix'),
    setprefix: require('./commands/misc/setprefix'),
    // ----------
  };
};
exports.getApplicationCommands = () => {
  return {
    //Timer
    goats: require('./commands/timer/goats/index.js'),
    remind: require('./commands/timer/remind'),
    //Hub
    help: require('./commands/hub/help/index.js'),
    info: require('./commands/hub/info/index.js'),
    sheets: require('./commands/hub/sheets/index.js'),
    loot: require('./commands/hub/loot'),
  };
};
