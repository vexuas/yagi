const { token, guildIDs } = require('../../../config/yagi.json');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { createGuildTable } = require('../../services/database');
const {
  sendErrorLog,
  getWorldBossData,
  getServerTime,
  validateWorldBossData,
  sendHealthLog,
  checkIfInDevelopment,
} = require('../../utils/helpers');

const rest = new REST({ version: '9' }).setToken(token);
const activitylist = [
  '/about | bot information',
  '/goats | Olympus wb',
  '/help | command list',
  'v3.1.0 | 05/03/2023',
];
//TODO: Refactor these someday
module.exports = ({ yagi, appCommands }) => {
  /**
   * Event handler that fires only once when yagi is done booting up
   * Houses function initialisations such as database creation and activity list randomizer
   */
  yagi.once('ready', async () => {
    try {
      await registerApplicationCommands(yagi);
      const testChannel = yagi.channels.cache.get('582213795942891521');
      testChannel.send("I'm booting up! (◕ᴗ◕✿)"); //Sends to test bot channel in yagi's den
      /**
       * Initial call to the Olympus spreadsheet and get world boss data
       * As the public sheet isn't accurate with the timestamps given (only returns time and not date), we validate the data first. See more info in the helpers file
       * After the data gets validated and is as accurate as possible now, we'll then be using this to store in our database
       */
      const worldBossData = await getWorldBossData();
      const serverTime = getServerTime();
      const validatedWorldBossData = validateWorldBossData(worldBossData, serverTime);
      /**
       * Initialise Database and its tables
       * Will create them if they don't exist
       * See relevant files under database/* for more information
       */
      await createGuildTable(yagi.guilds.cache, yagi);
      /**
       * Changes Yagi's activity every 2 minutes on random
       * Starts on the first index of the activityList array and then sets to a different one after
       */
      yagi.user.setActivity(activitylist[0]);
      setInterval(() => {
        const index = Math.floor(Math.random() * (activitylist.length - 1) + 1);
        yagi.user.setActivity(activitylist[index]);
      }, 120000);
      const healthChannel = yagi.channels.cache.get('866297328159686676'); //goat-health channel in Yagi's Den
      sendHealthLog(healthChannel, worldBossData, validatedWorldBossData, 'timer');
    } catch (e) {
      sendErrorLog(yagi, e);
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
  const registerApplicationCommands = async (yagi) => {
    const isInDevelopment = checkIfInDevelopment(yagi);
    const commandList = Object.keys(appCommands)
      .map((key) => appCommands[key].data)
      .map((command) => command.toJSON());

    try {
      if (isInDevelopment) {
        await rest.put(Routes.applicationGuildCommands('929421200797626388', guildIDs), {
          body: commandList,
        });
        console.log('Successfully registered guild application commands');
      } else {
        await rest.put(Routes.applicationCommands('518196430104428579'), { body: commandList });
        console.log('Successfully registered global application commands');
      }
    } catch (error) {
      console.log(error);
    }
  };
};
