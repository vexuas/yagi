import { Client, Intents } from 'discord.js';
import Mixpanel from 'mixpanel';
import { AutoPoster } from 'topgg-autoposter';
import { registerEventHandlers } from './events/events';
import { BOT_TOKEN, MIXPANEL_ID, TOP_GG_TOKEN } from './config/environment';
import { isEmpty } from 'lodash';

const yagi: Client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/**
 * Entry point for yagi or any discord bot in general
 * We want to create a discordjs Client which is the main hub for interacting with the Discord API
 * We then login using our bot's token to establish a connection with Discord
 */
const initialize = async () => {
  try {
    await yagi.login(BOT_TOKEN);
    const mixpanel: Mixpanel.Mixpanel | null =
      MIXPANEL_ID && !isEmpty(MIXPANEL_ID) ? Mixpanel.init(MIXPANEL_ID) : null;
    TOP_GG_TOKEN && !isEmpty(TOP_GG_TOKEN) && AutoPoster(TOP_GG_TOKEN, yagi);
    registerEventHandlers({ yagi, mixpanel });
  } catch (error) {
    console.log(error);
  }
};
initialize();
