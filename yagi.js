const Discord = require('discord.js');
const {
  token,
  bisoMixpanel,
  yagiMixpanel,
  topggToken,
  guildIDs,
  defaultPrefix,
} = require('./config/yagi.json');
const { getApplicationCommands } = require('./commands');
const yagi = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
const Mixpanel = require('mixpanel');
const {
  sendErrorLog,
  checkIfInDevelopment,
  getWorldBossData,
  getServerTime,
  validateWorldBossData,
  sendHealthLog,
  codeBlock,
} = require('./helpers');
const { sendMixpanelEvent } = require('./analytics');
const { AutoPoster } = require('topgg-autoposter');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { createGuildTable, insertNewGuild, deleteGuild } = require('./database');

const rest = new REST({ version: '9' }).setToken(token);

const activitylist = [
  'info | bot information',
  'ping me for prefix!',
  'goats | Olympus wb',
  'help | command list',
  'setprefix | custom prefix',
  'v2.7.0 | 11/12/2021',
];
let mixpanel;

const appCommands = getApplicationCommands();
//----------
/**
 * Initialize yagi to log in and establish a connection to Discord
 * Wrapped in an async function as we want to wait for the promise to end so that our mixpanel instance knows which project to initialize in
 */
const initialize = async () => {
  await yagi.login(token);
  mixpanel = Mixpanel.init(checkIfInDevelopment(yagi) ? bisoMixpanel : yagiMixpanel);
  !checkIfInDevelopment(yagi) && AutoPoster(topggToken, yagi);
};
initialize();

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
//------
/**
 * Event handlers for when yagi is invited to a new server, when he is kicked or when the guild he is in is updated
 * Sends notification to channel in Yagi's Den
 * guildCreate - called when yagi is invited to a server
 * guildDelete - called when yagi is kicked from server
 * More information about each function in their relevant database files
 */
yagi.on('guildCreate', async (guild) => {
  try {
    await insertNewGuild(guild, yagi);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('guildDelete', async (guild) => {
  try {
    await deleteGuild(guild, yagi);
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
//------
/**
 * Event handler for when a message is sent in a channel that yagi is in
 * Keeping this in for now for legacy sake and letting users know we've switched over to application commands
 * TODO: Remove this after a couple of months
 */
yagi.on('messageCreate', async (message) => {
  const yagiPrefix = defaultPrefix;
  if (message.author.bot) return; //Ignore messages made by yagi

  const embed = {
    description: `Yagi no longer supports prefix commands and instead uses Slash Commands now.\nFor example: \`${defaultPrefix}goats\` -> \`/goats\`.\n\nTo see the full list of commands, use \`/help\``,
    color: 32896,
  };
  try {
    message.mentions.users.forEach((user) => {
      if (user === yagi.user) {
        return message.channel.send({ embeds: [embed] });
      }
    });
    //Ignores messages without a prefix
    if (message.content.startsWith(yagiPrefix)) {
      return message.channel.send({ embeds: [embed] });
    } else {
      return;
    }
  } catch (e) {
    sendErrorLog(yagi, e);
  }
});
yagi.on('error', (error) => {
  sendErrorLog(yagi, error);
});
yagi.on('interactionCreate', async (interaction) => {
  if (!interaction.inGuild()) return; //Only respond in server channels or if it's an actual command

  if (interaction.isCommand()) {
    const { commandName } = interaction;
    await appCommands[commandName].execute({ interaction, yagi });
    sendMixpanelEvent({
      user: interaction.user,
      channel: interaction.channel,
      guild: interaction.guild,
      command: commandName,
      client: mixpanel,
    }); //Send tracking event to mixpanel
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
    .filter((command) => command)
    .map((command) => command.toJSON());

  try {
    if (isInDevelopment) {
      await rest.put(Routes.applicationGuildCommands('929421200797626388', guildIDs), {
        body: commandList,
      });
      console.log('Successfully registered guild application commands');
    } else {
      //TODO: Add global register here
    }
  } catch (error) {
    console.log(error);
  }
};
