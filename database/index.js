const { Pool } = require('pg');
const { databaseConfig } = require('../config/database');
const { sendGuildUpdateNotification, generateUUID } = require('../helpers');
const pool = new Pool(databaseConfig);

exports.createGuildTable = async (guildsOfYagi, yagi) => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const createGuildTableQuery =
        'CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, owner_id TEXT NOT NULL)';
      await client.query(createGuildTableQuery);

      const guildsInDatabase = await this.getGuilds();
      guildsOfYagi.forEach(async (guild) => {
        const isInDatabase = guildsInDatabase.rows.find((guildDb) => guildDb.uuid === guild.id);
        if (!isInDatabase) {
          await this.insertNewGuild(guild, yagi, client);
        }
      });
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
exports.getGuilds = async () => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const getAllGuildsQuery = 'SELECT * FROM Guild';
      const allGuilds = await client.query(getAllGuildsQuery);
      return allGuilds;
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
exports.insertNewGuild = async (newGuild, yagi, existingClient) => {
  let client = existingClient ? existingClient : await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const insertNewGuildQuery =
        'INSERT INTO Guild (uuid, name, member_count, owner_id) VALUES ($1, $2, $3, $4)';
      await client.query(insertNewGuildQuery, [
        newGuild.id,
        newGuild.name,
        newGuild.memberCount,
        newGuild.ownerId,
      ]);
      await client.query('COMMIT');
      await sendGuildUpdateNotification(yagi, newGuild, 'join');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
/**
 * Handlers for timers database below
 * Porting over the current handlers but I might have to refactor how this is done
 */
exports.createTimerTable = async () => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const createTimerTableQuery =
        'CREATE TABLE IF NOT EXISTS Timer(uuid TEXT NOT NULL, last_retrieved_at DATE NOT NULL, location TEXT NOT NULL, next_spawn TEXT NOT NULL, projected_next_spawn TEXT NOT NULL, accurate BOOLEAN NOT NULL)';
      await client.query(createTimerTableQuery);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
exports.getCurrentTimer = async () => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const getTimerQuery = `SELECT * FROM Timer`;
      const timer = await client.query(getTimerQuery);
      return timer.rowCount > 0 ? timer.rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
exports.insertNewTimer = async (worldBoss) => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const insertTimerQuery =
        'INSERT INTO Timer(uuid, last_retrieved_at, location, next_spawn, projected_next_spawn, accurate) VALUES ($1, $2, $3, $4, $5, $6)';
      await client.query(insertTimerQuery, [
        generateUUID(),
        new Date(),
        worldBoss.location,
        worldBoss.nextSpawn,
        worldBoss.projectedNextSpawn,
        worldBoss.accurate,
      ]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
exports.updateTimer = async (timer, worldBoss) => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const updateTimerQuery =
        'UPDATE Timer SET last_retrieved_at = ($1), location = ($2), next_spawn = ($3), projected_next_spawn = ($4), accurate = ($5) WHERE uuid = ($6)';
      await client.query(updateTimerQuery, [
        new Date(),
        worldBoss.location,
        worldBoss.nextSpawn,
        worldBoss.projectedNextSpawn,
        worldBoss.accurate,
        timer.uuid,
      ]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      client.release();
    }
  }
};
