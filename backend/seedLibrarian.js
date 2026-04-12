// seedLibrarian.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Load DB config from .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
};

const librarian = {
  first_name: 'Doreen',
  last_name: 'Blis',
  email: 'doreenblis@gmail.com',
  username: 'librarian',
  password: 'doreen123', // plain text, will be hashed
  role: 'librarian'
};

async function seedLibrarian() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    // Check if user exists (use user_id instead of id)
    const [rows] = await conn.execute('SELECT user_id FROM users WHERE email = ?', [librarian.email]);
    if (rows.length > 0) {
      console.log('Librarian already exists.');
      return;
    }
    // Hash password
    const hashed = await bcrypt.hash(librarian.password, 10);
    // Insert user
    await conn.execute(
      `INSERT INTO users (first_name, last_name, email, username, password_hash, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [librarian.first_name, librarian.last_name, librarian.email, librarian.username, hashed, librarian.role]
    );
    console.log('Librarian created successfully!');
  } catch (err) {
    console.error('Error seeding librarian:', err);
  } finally {
    await conn.end();
  }
}

seedLibrarian();
