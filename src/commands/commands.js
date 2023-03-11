const fs = require('fs');
const path = require('path');

/**
 * Handler to get application commands to be used in event listeners/registers
 * Similar to how we load event listeners to read files
 * Uses readdirSync however as we want to finish reading the files first
 * This is so we can return an actual appCommands object
 */
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
        const modulePath = `./${filePath.replace('src/commands/', '')}`;
        appCommands[directoryPath.replace('src/commands/', '')] = require(modulePath);
      }
    });
  };
  loadModules('./src/commands');
  return appCommands;
};
