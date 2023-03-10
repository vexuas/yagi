const fs = require('fs');
const path = require('path');
const { getApplicationCommands } = require('../commands');

const appCommands = getApplicationCommands();

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
          currentModule(yagi, appCommands, mixpanel);
        }
      });
    });
  };
  loadModules('./events');
};
