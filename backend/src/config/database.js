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

// Initialize database tables on startup
async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // Create book_views table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS book_views (
        view_id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT NOT NULL,
        user_id INT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_book_id (book_id),
        INDEX idx_viewed_at (viewed_at)
      )
    `);
    
    // Add cover_url and book_file_url columns if they don't exist
    try {
      await connection.query(`
        ALTER TABLE books ADD COLUMN cover_url VARCHAR(255) AFTER description
      `);
      console.log('✅ Added cover_url column to books');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log('cover_url column already exists');
      }
    }
    
    try {
      await connection.query(`
        ALTER TABLE books ADD COLUMN book_file_url VARCHAR(255) AFTER cover_url
      `);
      console.log('✅ Added book_file_url column to books');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log('book_file_url column already exists');
      }
    }
    
    connection.release();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
  }
}

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected');
    conn.release();
    // Initialize tables after connection
    initializeTables();
  })
  .catch(err => {
    console.error('❌ MySQL Error:', err.message);
  });

module.exports = pool;
