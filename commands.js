exports.getApplicationCommands = () => {
  return {
    //Timer
    goats: require('./commands/timer/goats/index.js'),
    remind: require('./commands/timer/remind'),
    //Hub
    help: require('./commands/hub/help/index.js'),
    about: require('./commands/hub/about/index.js'),
    sheets: require('./commands/hub/sheets/index.js'),
    loot: require('./commands/hub/loot'),
    invite: require('./commands/hub/invite'),
  };
};
