// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.errorCode || null;

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
