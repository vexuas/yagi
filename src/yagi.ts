import { Client, Intents } from 'discord.js';

import Mixpanel from 'mixpanel';
import { AutoPoster } from 'topgg-autoposter';
import { registerEventHandlers } from './events/events';
import { BOT_TOKEN, MIXPANEL_ID, TOP_GG_TOKEN } from './config/environment';
import { isEmpty } from 'lodash';

const yagi: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

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
