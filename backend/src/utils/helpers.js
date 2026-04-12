const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Hash Password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate Token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { user_id: userId, email, role },
    config.JWT.SECRET,
    { expiresIn: config.JWT.EXPIRE }
  );
};

// Verify Token
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT.SECRET);
};

// Format Date
const formatDate = (date) => {
  return date ? date.toISOString().split('T')[0] : null;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  formatDate,
};
