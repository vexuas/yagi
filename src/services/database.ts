import { Collection, Guild } from 'discord.js';
import { Pool, PoolClient } from 'pg';
import { databaseConfig } from '../config/database';
const pool: Pool = new Pool(databaseConfig);

type GuildRecord = {
  uuid: string;
  name: string;
  member_count: number;
  owner_id: string;
};

export async function createGuildTable(guildsOfYagi: Collection<string, Guild>) {
  const client: PoolClient = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const createGuildTableQuery =
        'CREATE TABLE IF NOT EXISTS Guild(uuid TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, member_count INTEGER NOT NULL, owner_id TEXT NOT NULL)';
      await client.query(createGuildTableQuery);

      const guildsInDatabase = await getGuilds();
      guildsOfYagi.forEach(async (guild: Guild) => {
        const isInDatabase =
          guildsInDatabase &&
          guildsInDatabase.rows.find((guildDb: GuildRecord) => guildDb.uuid === guild.id);
        if (!isInDatabase) {
          await insertNewGuild(guild, client);
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
}
export async function getGuilds() {
  const client: PoolClient = await pool.connect();
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
}
export async function insertNewGuild(newGuild: Guild, existingClient?: PoolClient) {
  let client: PoolClient = existingClient ? existingClient : await pool.connect();
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
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      //TODO: Add error handling
    } finally {
      !existingClient && client.release();
    }
  }
}
export async function deleteGuild(existingGuild: Guild) {
  const client: PoolClient = await pool.connect();
  if (client) {
    try {
      await client.query('BEGIN');
      const deleteGuildQuery = 'DELETE from Guild WHERE uuid = ($1)';
      await client.query(deleteGuildQuery, [existingGuild.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
    } finally {
      client.release();
    }
  }
}
