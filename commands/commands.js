const fs = require('fs');
const path = require('path');

exports.getApplicationCommands = () => {
  const appCommands = {};
  const loadModules = (directoryPath) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file.name);
      if (file.isDirectory()) {
        return loadModules(filePath);
      }
      if (file.name === 'index.js') {
        const modulePath = `./${filePath.replace('commands/', '')}`;
        appCommands[directoryPath.replace('commands/', '')] = require(modulePath);
      }
    });
  };
  loadModules('./commands');
  return appCommands;
};
