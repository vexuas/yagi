const sqlite = require('sqlite3').verbose();
const { generateUUID } = require('../helpers');

const createTimerTable = (database) => {
  database.run('CREATE TABLE IF NOT EXISTS Timer(uuid TEXT NOT NULL, last_retrieved_at DATE NOT NULL, location TEXT NOT NULL, last_spawn DATE NOT NULL, next_spawn DATE NOT NULL, accurate BOOLEAN NOT NULL)');
}

const insertNewTimer = (worldBoss) => {
  let database = new sqlite.Database('./database/yagi.db', sqlite.OPEN_READWRITE);
  database.run('INSERT INTO Timer(uuid, last_retrieved_at, location, last_spawn, next_spawn, accurate) VALUES ($uuid, $last_retrieved_at, $location, $last_spawn, $next_spawn, $accurate)', {
    $uuid: generateUUID(),
    $last_retrieved_at: new Date(),
    $location: worldBoss.location,
    $last_spawn: worldBoss.lastSpawn,
    $next_spawn: worldBoss.nextSpawn,
    $accurate: worldBoss.accurate
  }, error => {
    console.log(error);
  })
}
module.exports = {
  createTimerTable,
  insertNewTimer
}
