//TODO: Add a loop to import all of these instead of manually importing each one
exports.getApplicationCommands = () => {
  return {
    goats: require('./goats/'),
    remind: require('./remind'),
    help: require('./help'),
    about: require('./about'),
    sheets: require('./sheets'),
    loot: require('./loot'),
    invite: require('./invite'),
  };
};
