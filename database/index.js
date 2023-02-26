const { Pool } = require('pg');
const { databaseConfig } = require('../config/database');
const pool = new Pool(databaseConfig);

exports.createGuildTable = async (guildsOfYagi) => {
  const client = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const createGuildTableQuery =
        'CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, owner_id TEXT NOT NULL)';
      await client.query(createGuildTableQuery);
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
      console.log(allGuilds);
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
