require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  API_URL: process.env.API_URL || 'http://localhost:5000',
  
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'root',
    NAME: process.env.DB_NAME || 'lms_db',
    PORT: process.env.DB_PORT || 3306,
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'secret',
    EXPIRE: process.env.JWT_EXPIRE || '7d',
  },
};
