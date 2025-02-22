const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL');
  } catch (err) {
    console.error('Error conectándose a PostgreSQL:', err.message);
  }
})();

module.exports = pool;
