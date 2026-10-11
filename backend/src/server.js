const config = require('./config/config');
const { scheduleOverdueChecker } = require('./utils/ScheduleJobs');
const BookModel = require('./models/BookModel');
const app = require('./app');

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
