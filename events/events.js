const fs = require('fs');
const path = require('path');
const { getApplicationCommands } = require('../commands/commands');
const appCommands = getApplicationCommands();

/**
 * Handler to register event listeners for Yagi
 * Event listeners are housed in their own folders and exported
 * Below reads the files inside the /events folder and automatically imports and executes the exported listeners
 * Since each of the listeners are in their own folders, the handler is recursive to go one more folder deeper
 */
exports.registerEventHandlers = ({ yagi, mixpanel }) => {
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
          const modulePath = `./${filePath.replace('events', '')}`;
          const currentModule = require(modulePath);
          currentModule({ yagi, appCommands, mixpanel });
        }
      });
    });
  };
  loadModules('./events');
};
