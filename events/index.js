const { getApplicationCommands } = require('../commands');
const anything = require('./ready');
const anythingTwo = require('./guildCreate');
const anythingThree = require('./guildDelete');
const anythingFour = require('./messageCreate');
const anythingFive = require('./error');
const anythingSix = require('./interactionCreate');

const appCommands = getApplicationCommands();

exports.registerEventHandlers = ({ yagi, mixpanel }) => {
  anything(yagi, appCommands);
  anythingTwo(yagi);
  anythingThree(yagi);
  anythingFour(yagi);
  anythingFive(yagi);
  anythingSix(yagi, appCommands, mixpanel);
};
