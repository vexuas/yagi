const fs = require('fs');
const path = require('path');

exports.getApplicationCommands = () => {
  const appCommands = {};
  const loadModules = (directoryPath) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, files) => {
      if (error) {
        console.log(error);
      }
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file.name);
        if (file.isDirectory()) {
          return loadModules(filePath);
        }
        if (file.name === 'index.js') {
          const modulePath = `./${filePath.replace('commands/', '')}`;
          appCommands[directoryPath.replace('commands/', '')] = require(modulePath);
          console.log(directoryPath.replace('commands/', ''));
        }
      });
    });
  };
  loadModules('./commands');
  console.log(appCommands);
  return {
    goats: require('./goats'),
    remind: require('./remind'),
    help: require('./help'),
    about: require('./about'),
    sheets: require('./sheets'),
    loot: require('./loot'),
    invite: require('./invite'),
  };
};
