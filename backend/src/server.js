const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import scheduler & models
const { scheduleOverdueChecker } = require('./utils/ScheduleJobs');
const BookModel = require('./models/BookModel');

const path = require('path');
const app = express();


// Middleware
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  }
}));

// CORS Configuration
const corsOptions = {
  origin: [
    'https://readright-03h8.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded book files and covers statically
app.use('/uploads/books', express.static(path.join(__dirname, '../uploads/books')));

// Serve profile images statically
app.use('/uploads/profile-images', express.static(path.join(__dirname, '../uploads/profile-images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/books/:bookId/reviews', reviewRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  📚 LMS Backend Server                 ║
  ║  🚀 Running on Port ${PORT}              ║
  ║  🔐 JWT Authentication Enabled         ║
  ║  🗄️  MySQL Database Connected          ║
  ╚════════════════════════════════════════╝
  `);

  // Initialize scheduled jobs
  scheduleOverdueChecker();
  console.log('✅ Scheduled jobs initialized');

  // Populate missing book copies for existing books
  BookModel.populateMissingCopies().catch(err => console.error('❌ Error populating copies:', err));
});

module.exports = app;
