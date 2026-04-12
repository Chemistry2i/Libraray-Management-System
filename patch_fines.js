const fs = require('fs');

// Patch BorrowingController
const bcPath = 'backend/src/controllers/BorrowingController.js';
let bc = fs.readFileSync(bcPath, 'utf8');

const adminFinesStr = `
  // Admin: Get all outstanding fines
  static async getAllFines(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const { fines, total } = await BorrowingService.getAllFines(page, limit);
      res.status(200).json({ status: 'success', data: { fines, total } });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Waive fine
  static async waiveFine(req, res, next) {
    try {
      const borrowId = req.params.borrowId;
      await BorrowingService.waiveFine(borrowId);
      res.status(200).json({ status: 'success', message: 'Fine waived successfully' });
    } catch (error) {
      next(error);
    }
  }
`;

if (!bc.includes('getAllFines')) {
  bc = bc.replace('class BorrowingController {', 'class BorrowingController {' + adminFinesStr);
  fs.writeFileSync(bcPath, bc);
}

// Patch BorrowingService
const bsPath = 'backend/src/services/BorrowingService.js';
let bs = fs.readFileSync(bsPath, 'utf8');

const bsFinesStr = `
  static async getAllFines(page, limit) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      \`SELECT br.borrow_id, br.user_id, br.book_id, br.fine_amount, br.status, br.due_date, br.return_date, 
              u.username, u.email, b.title 
       FROM borrowing_records br
       JOIN users u ON br.user_id = u.user_id
       JOIN books b ON br.book_id = b.book_id
       WHERE br.fine_amount > 0
       ORDER BY br.borrow_id DESC
       LIMIT ? OFFSET ?\`, [limit, offset]
    );
    const [count] = await pool.query('SELECT COUNT(*) as total FROM borrowing_records WHERE fine_amount > 0');
    return { fines: rows, total: count[0].total };
  }

  static async waiveFine(borrowId) {
    const [borrowing] = await pool.query('SELECT fine_amount FROM borrowing_records WHERE borrow_id = ?', [borrowId]);
    if (borrowing.length === 0) throw new Error('Record not found');
    await pool.query('UPDATE borrowing_records SET fine_amount = 0 WHERE borrow_id = ?', [borrowId]);
    return true;
  }
`;

if (!bs.includes('getAllFines')) {
  bs = bs.replace('class BorrowingService {', 'class BorrowingService {' + bsFinesStr);
  fs.writeFileSync(bsPath, bs);
}

// Patch borrowingRoutes
const brPath = 'backend/src/routes/borrowingRoutes.js';
let br = fs.readFileSync(brPath, 'utf8');

const brFinesStr = `
// Fines management
router.get('/admin/fines', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), BorrowingController.getAllFines);
router.patch('/admin/fines/:borrowId/waive', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), BorrowingController.waiveFine);
`;

if (!br.includes('/admin/fines')) {
  br += brFinesStr;
  fs.writeFileSync(brPath, br);
}

console.log("Fines backend complete");
