import { Client, TextChannel } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { createGuildTable } from '../../services/database';
import { sendErrorLog } from '../../utils/helpers';
import { BOT_TOKEN, ENV, GUILD_IDS } from '../../config/environment';

const rest: REST = new REST({ version: '9' }).setToken(BOT_TOKEN);
const activitylist: string[] = [
  '/about | bot information',
  '/goats | Olympus wb',
  '/help | command list',
  'v3.2.4 | 01/05/2023',
];

//TODO: Refactor these someday
interface Props {
  yagi: Client;
  appCommands: any;
}
export default function ({ yagi, appCommands }: Props) {
  /**
   * Event handler that fires only once when yagi is done booting up
   * Houses function initialisations such as database creation and activity list randomizer
   */
  yagi.once('ready', async () => {
    try {
      await registerApplicationCommands();
      const testChannel = yagi.channels.cache.get('582213795942891521') as TextChannel;
      testChannel.send("I'm booting up! (◕ᴗ◕✿)"); //Sends to test bot channel in yagi's den
      /**
       * Initialise Database and its tables
       * Will create them if they don't exist
       * See relevant files under database/* for more information
       */
      await createGuildTable(yagi.guilds.cache);
      /**
       * Changes Yagi's activity every 2 minutes on random
       * Starts on the first index of the activityList array and then sets to a different one after
       */
      yagi.user && yagi.user.setActivity(activitylist[0]);
      setInterval(() => {
        const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
        yagi.user && yagi.user.setActivity(activitylist[index]);
      }, 120000);
    } catch (e) {
      sendErrorLog(yagi, e as Error);
    }
  });
  /**
   * Function to register application commands
   * Application commands are different from regular prefix commands as instead of the bot directly responding to messages, discord would be the one doing it
   * In order to do that, we have to register the bot's application commands to discord first before it can be used
   * Two types of application commands:
   * - Guild Commands
   * - Global Commands
   * Basicailly guild commands can only be used in that server it was registered in
   * While global commands can be used to every server that bot is in
   * Main difference between the two apart from server constraints are that app commands are instantly registered in guilds while global would take up to an hour for changes to appear
   */
  const registerApplicationCommands = async () => {
    const commandList = Object.keys(appCommands)
      .map((key) => appCommands[key].data)
      .map((command) => command.toJSON());

    try {
      if (ENV === 'dev') {
        if (GUILD_IDS) {
          await rest.put(Routes.applicationGuildCommands('929421200797626388', GUILD_IDS), {
            body: commandList,
          });
          console.log('Successfully registered guild application commands');
        }
      } else {
        await rest.put(Routes.applicationCommands('518196430104428579'), { body: commandList });
        console.log('Successfully registered global application commands');
      }
    } catch (error) {
      console.log(error);
    }
  };
}
