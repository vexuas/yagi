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
