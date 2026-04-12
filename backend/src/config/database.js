const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.DB.HOST,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.NAME,
  port: config.DB.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
  enableKeepAlive: true,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Error:', err.message);
  });

module.exports = pool;
