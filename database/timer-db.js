const sqlite = require('sqlite3').verbose();
const { generateUUID, getWorldBossData, getServerTime, validateWorldBossData } = require('../helpers');

const createTimerTable = (database, worldBoss) => {
  database.serialize(() => {
    database.run('CREATE TABLE IF NOT EXISTS Timer(uuid TEXT NOT NULL, last_retrieved_at DATE NOT NULL, location TEXT NOT NULL, next_spawn TEXT NOT NULL, projected_next_spawn TEXT NOT NULL, accurate BOOLEAN NOT NULL)');

    database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, (error, timer) => {
      if(error){
        console.log(error);
      }
      if(!timer){
        insertNewTimer(database, worldBoss);
      }
    }) 
  })
}

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

const getCurrentTimerData = () => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.get(`SELECT * FROM Timer WHERE rowid = ${1}`, async (error, timer) => {
    if(error){
      console.log(error)
    }
    if(timer.accurate === 1){
      console.log(timer);
    } else {
      const worldBossData = await getWorldBossData();
      const serverTime = getServerTime();
      const validatedWorldBossData = validateWorldBossData(worldBossData, serverTime);
      console.log(validatedWorldBossData);

      database.run(`UPDATE Timer SET last_retrieved_at = ${Date.now()}, location = "${validatedWorldBossData.location}", next_spawn = "${validatedWorldBossData.nextSpawn}", projected_next_spawn = "${validatedWorldBossData.projectedNextSpawn}", accurate = ${validatedWorldBossData.accurate} WHERE uuid = "${timer.uuid}"`, error => {
        if(error){
          console.log(error);
        }
        console.log('Get new data and updated');
      })
    }
  })
}
module.exports = {
  createTimerTable,
  insertNewTimer,
  getCurrentTimerData
}
