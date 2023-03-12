const Discord = require('discord.js');
const yagi = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
const Mixpanel = require('mixpanel');
const { AutoPoster } = require('topgg-autoposter');
const { registerEventHandlers } = require('./events/events.js');
const { BOT_TOKEN, MIXPANEL_ID, TOP_GG_TOKEN } = require('./config/environment');
const { isEmpty } = require('lodash');

//----------
/**
 * Initialize yagi to log in and establish a connection to Discord
 * Wrapped in an async function as we want to wait for the promise to end so that our mixpanel instance knows which project to initialize in
 */
const initialize = async () => {
  try {
    await yagi.login(BOT_TOKEN);
    const mixpanel = MIXPANEL_ID && !isEmpty(MIXPANEL_ID) && Mixpanel.init(MIXPANEL_ID);
    TOP_GG_TOKEN && !isEmpty(TOP_GG_TOKEN) && AutoPoster(TOP_GG_TOKEN, yagi);
    registerEventHandlers({ yagi, mixpanel });
  } catch (error) {
    console.log(error);
  }
};
initialize();
