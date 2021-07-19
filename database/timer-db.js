const sqlite = require('sqlite3').verbose();
const { generateUUID, getWorldBossData, getServerTime, validateWorldBossData, sendHealthLog } = require('../helpers');
const { startReminders } = require('./reminder-db');
const { isBefore } = require('date-fns');

/**
 * Creates Timer table inside the Yagi Database
 * Gets called in the client.once("ready") hook
 * Primarily used to keep track of the world boss data without having to always request the data in the spreadsheet
 * This is useful as the dynamic nature of the world boss timings would require having multiple calls in between intervals to know if the data is accurate
 * In saving the timer data in our end, we lessen the number of those calls and the complexity it brings
 * @param database - yagi database
 * @param worldBoss - validated world boss object data; note that we want our database to be as accurate as possible hence we don't use the raw data from the sheet
 */
const createTimerTable = (database, worldBoss, client) => {
  //Wrapped in a serlialize to ensure that each method is called in order in which it is initialised
  database.serialize(() => {
    //Creates Timer table with relevant columns if it does not exist
    database.run('CREATE TABLE IF NOT EXISTS Timer(uuid TEXT NOT NULL, last_retrieved_at DATE NOT NULL, location TEXT NOT NULL, next_spawn TEXT NOT NULL, projected_next_spawn TEXT NOT NULL, accurate BOOLEAN NOT NULL)');

    database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, (error, timer) => {
      if(error){
        console.log(error);
      }
      //Check if there's an existing timer in our database
      if(timer){
        //Update the timer if it does
        updateTimerData(worldBoss, timer);
      } else {
        //Create a new timer if it doesn't
        insertNewTimer(database, worldBoss);
      }
    });
    startReminders(client); //Start existing enabled reminders on their timer countdowns on initialisation
  })
}
/**
 * Adds new timer Timer table
 * @param database - yagi database
 * @param worldBoss - validated world boss data
 */
const insertNewTimer = (database, worldBoss) => {
  database.run('INSERT INTO Timer(uuid, last_retrieved_at, location, next_spawn, projected_next_spawn, accurate) VALUES ($uuid, $last_retrieved_at, $location, $next_spawn, $projected_next_spawn, $accurate)', {
    $uuid: generateUUID(),
    $last_retrieved_at: new Date(),
    $location: worldBoss.location,
    $next_spawn: worldBoss.nextSpawn,
    $projected_next_spawn: worldBoss.projectedNextSpawn,
    $accurate: worldBoss.accurate
  }, error => {
    if(error){
      console.log(error);
    }
  })
}
/**
 * Updates data of existing timer with new details in database
 * To be accurate as possible, we're updating every column on every function call
 * @param {*} worldBoss - validated world boss data
 * @param {*} timer - existing timer in table
 */
const updateTimerData = (worldBoss, timer) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run(`UPDATE Timer SET last_retrieved_at = ${Date.now()}, location = "${worldBoss.location}", next_spawn = "${worldBoss.nextSpawn}", projected_next_spawn = "${worldBoss.projectedNextSpawn}", accurate = ${worldBoss.accurate} WHERE uuid = "${timer.uuid}"`, error => {
    if(error){
      console.log(error);
    }
  })
}
/**
 * Function to stay up to date with world boss data and be accurate as possible
 * Gets called in the client.once('ready') hook and inside a setInterval to constantly update our timer data
 * To lessen the amount of unnecessary calls, we only want to make a request to the spreadsheet if our previous data is not accurate or the next spawn date has already passed
 * Regardless of a ping to the sheet, we call the startReminders to restart the timers for enabled reminders
 * @param client - yagi client; use to get the discord channel to send health logs and ensure that our timer is working
 */
const getCurrentTimerData = (client) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.serialize(() => {
    database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, async (error, timer) => {
      if(error){
        console.log(error)
      }
      const serverTime = getServerTime();
      const healthChannel = client.channels.cache.get('866297328159686676'); //goat-health channel in Yagi's Den
  
      if(timer.accurate === 0 || isBefore(timer.next_spawn, serverTime) ){
        const worldBossData = await getWorldBossData();
        
        const validatedWorldBossData = validateWorldBossData(worldBossData, serverTime);
        updateTimerData(validatedWorldBossData, timer);
        
        sendHealthLog(healthChannel, worldBossData, validatedWorldBossData);
      }
    })
    startReminders(client);
  })
}

module.exports = {
  createTimerTable,
  insertNewTimer,
  getCurrentTimerData
}
