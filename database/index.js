const { Pool } = require('pg');
const { databaseConfig } = require('../config/database');
const pool = new Pool(databaseConfig);

export function createGuildTable() {
  const client = pool.connect();
  try {
  } catch (error) {
  } finally {
  }
}
