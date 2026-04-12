const cron = require('node-cron');
const database = require('../config/database');
const pool = database.pool;

// Run every day at 2 AM
const scheduleOverdueChecker = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔔 Running overdue books checker...');
    try {
      const [borrowings] = await pool.query(`
        SELECT br.*, u.email, u.username, b.title as book_title
        FROM borrowing_records br
        JOIN users u ON br.user_id = u.user_id
        JOIN books b ON br.book_id = b.book_id
        WHERE br.status = 'active'
        AND br.due_date < CURDATE()
      `);

      if (borrowings.length > 0) {
        for (const borrowing of borrowings) {
          // Update status to overdue
          await pool.query(`
            UPDATE borrowing_records 
            SET status = 'overdue', 
                updated_at = NOW()
            WHERE borrow_id = ?
          `, [borrowing.borrow_id]);

          // Calculate fine
          const today = new Date();
          const returnDate = new Date(borrowing.due_date);
          const daysOverdue = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24));
          const fineAmount = daysOverdue * (borrowing.fine_amount || 500);

          // Record fine
          await pool.query(`
            INSERT INTO fine_payments (borrow_id, user_id, fine_amount, days_overdue, status)
            VALUES (?, ?, ?, ?, 'pending')
          `, [borrowing.borrow_id, borrowing.user_id, fineAmount, daysOverdue]);

          console.log(`⚠️ Marked as overdue: ${borrowing.book_title} - User: ${borrowing.username} - Fine: Shs ${fineAmount}`);
        }

        console.log(`✅ Marked ${borrowings.length} books as overdue`);
      } else {
        console.log('✅ No overdue books found');
      }
    } catch (error) {
      console.error('❌ Error in overdue checker:', error);
    }
  });

  console.log('📅 Overdue checker scheduled (runs daily at 2 AM)');
};

module.exports = {
  scheduleOverdueChecker
};
