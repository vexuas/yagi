const fs = require('fs');
const path = require('path');
const { getApplicationCommands } = require('../commands');
const anything = require('./ready');
const anythingTwo = require('./guildCreate');
const anythingThree = require('./guildDelete');
const anythingFour = require('./messageCreate');
const anythingFive = require('./error');
const anythingSix = require('./interactionCreate');

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
          console.log('wtf');
        }
      });
    });
  };
  loadModules('./events');

  anything(yagi, appCommands);
  anythingTwo(yagi);
  anythingThree(yagi);
  anythingFour(yagi);
  anythingFive(yagi);
  anythingSix(yagi, appCommands, mixpanel);
};
