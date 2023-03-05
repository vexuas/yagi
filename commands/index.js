exports.getApplicationCommands = () => {
  return {
    //Timer
    goats: require('./goats/'),
    remind: require('./remind'),
    //Hub
    help: require('./help'),
    about: require('./about'),
    sheets: require('./sheets'),
    loot: require('./loot'),
    invite: require('./invite'),
  };
};
