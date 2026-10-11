require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  API_URL: process.env.API_URL || 'http://localhost:5000',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'https://kamuli-cu.vercel.app,http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  
  DB: {
    HOST: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    USER: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'root',
    NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || 'lms_db',
    PORT: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'secret',
    EXPIRE: process.env.JWT_EXPIRE || '7d',
  },
};
