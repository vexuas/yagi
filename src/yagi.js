const Discord = require('discord.js');
const { token, bisoMixpanel, yagiMixpanel, topggToken } = require('../config/yagi.json');
const yagi = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
const Mixpanel = require('mixpanel');
const { AutoPoster } = require('topgg-autoposter');
const { registerEventHandlers } = require('./events/events.js');
const { checkIfInDevelopment } = require('./utils/helpers');
let mixpanel;

//----------
/**
 * Initialize yagi to log in and establish a connection to Discord
 * Wrapped in an async function as we want to wait for the promise to end so that our mixpanel instance knows which project to initialize in
 */
const initialize = async () => {
  await yagi.login(token);
  mixpanel = Mixpanel.init(checkIfInDevelopment(yagi) ? bisoMixpanel : yagiMixpanel);
  !checkIfInDevelopment(yagi) && AutoPoster(topggToken, yagi);
  registerEventHandlers({ yagi, mixpanel });
};
initialize();
