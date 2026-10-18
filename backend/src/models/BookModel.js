const pool = require('../config/database');
const { DatabaseError, ValidationError } = require('../exceptions/AppError');

class BookModel {
  static async findAll(limit, offset) {
    try {
      const [rows] = await pool.query(
        'SELECT b.*, c.category_name FROM books b LEFT JOIN categories c ON b.category_id = c.category_id LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM books');
      return { books: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async findById(bookId) {
    try {
      const [rows] = await pool.query(
        'SELECT b.*, c.category_name FROM books b LEFT JOIN categories c ON b.category_id = c.category_id WHERE b.book_id = ?',
        [bookId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.query(
        'SELECT b.*, c.category_name FROM books b LEFT JOIN categories c ON b.category_id = c.category_id WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? LIMIT 20',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  static async create(bookData) {
    const connection = await pool.getConnection();
    try {
      const { title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, cover_cloudinary_public_id, book_file_url } = bookData;
      console.log('DEBUG: BookModel.create bookData:', bookData);
      
      // Start transaction
      await connection.beginTransaction();

      // Insert book record
      const [result] = await connection.query(
        'INSERT INTO books (title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, cover_cloudinary_public_id, book_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, cover_cloudinary_public_id, book_file_url]
      );

      const bookId = result.insertId;

      // Create book_copies records (one for each physical copy)
      const numCopies = total_copies || 1;
      for (let i = 0; i < numCopies; i++) {
        await connection.query(
          'INSERT INTO book_copies (book_id, status) VALUES (?, ?)',
          [bookId, 'available']
        );
      }

      // Commit transaction
      await connection.commit();
      console.log(`✅ Created book (ID: ${bookId}) with ${numCopies} physical copies`);
      return bookId;
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error('DEBUG: BookModel.create error:', error);
      throw new DatabaseError(error.message);
    } finally {
      connection.release();
    }
  }

  static async update(bookId, updateData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const editableColumns = ['title', 'author', 'isbn', 'category_id', 'publication_year', 'publisher', 'description', 'book_file_url'];
      const assignments = [];
      const values = [];
      editableColumns.forEach((column) => {
        if (Object.prototype.hasOwnProperty.call(updateData, column)) {
          assignments.push(`\`${column}\` = ?`);
          values.push(updateData[column]);
        }
      });
      if (Object.prototype.hasOwnProperty.call(updateData, 'cover_url')) {
        assignments.push('cover_url = ?', 'cover_cloudinary_public_id = ?');
        values.push(updateData.cover_url, updateData.cover_cloudinary_public_id || null);
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'total_copies')) {
        const requestedTotal = Number(updateData.total_copies);
        if (!Number.isInteger(requestedTotal) || requestedTotal < 1) {
          throw new ValidationError('Total copies must be a whole number greater than zero');
        }
        const [copies] = await connection.query(
          'SELECT copy_id, status FROM book_copies WHERE book_id = ? ORDER BY copy_id FOR UPDATE',
          [bookId]
        );
        const [openLoans] = await connection.query(
          'SELECT copy_id FROM borrowing_records WHERE book_id = ? AND status <> \'returned\'',
          [bookId]
        );
        const referencedCopyIds = new Set(openLoans.map((loan) => Number(loan.copy_id)));
        const protectedCopies = copies.filter((copy) => copy.status !== 'available' || referencedCopyIds.has(Number(copy.copy_id)));
        if (requestedTotal < protectedCopies.length) {
          throw new ValidationError(`Total copies cannot be lower than ${protectedCopies.length}; some copies are borrowed, reserved, damaged, or have open requests`);
        }

        const deleteCount = Math.max(0, copies.length - requestedTotal);
        const removableCopies = copies
          .filter((copy) => copy.status === 'available' && !referencedCopyIds.has(Number(copy.copy_id)))
          .slice(0, deleteCount);
        if (removableCopies.length) {
          await connection.query(
            `DELETE FROM book_copies WHERE copy_id IN (${removableCopies.map(() => '?').join(', ')})`,
            removableCopies.map((copy) => copy.copy_id)
          );
        }
        const copiesToAdd = requestedTotal - (copies.length - removableCopies.length);
        for (let index = 0; index < copiesToAdd; index += 1) {
          await connection.query('INSERT INTO book_copies (book_id, status) VALUES (?, \'available\')', [bookId]);
        }
        const currentAvailable = copies.filter((copy) => copy.status === 'available').length;
        assignments.push('total_copies = ?', 'available_copies = ?');
        values.push(requestedTotal, currentAvailable - removableCopies.length + copiesToAdd);
      }
      if (!assignments.length) throw new ValidationError('No book fields were supplied for update');
      await connection.query(
        `UPDATE books SET ${assignments.join(', ')} WHERE book_id = ?`,
        [...values, bookId]
      );
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      if (error.statusCode) throw error;
      throw new DatabaseError(error.message);
    } finally {
      connection.release();
    }
  }

  static async delete(bookId) {
    try {
      await pool.query('DELETE FROM books WHERE book_id = ?', [bookId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Record a book view
  static async recordView(bookId, userId = null) {
    try {
      await pool.query(
        'INSERT INTO book_views (book_id, user_id) VALUES (?, ?)',
        [bookId, userId]
      );
      return true;
    } catch (error) {
      console.error('Error recording view:', error);
      // Don't throw - just log. View tracking shouldn't break the app
      return false;
    }
  }

  // Get book statistics (views count and times borrowed)
  static async getBookStats(bookId) {
    try {
      const [stats] = await pool.query(`
        SELECT 
          COALESCE(COUNT(DISTINCT v.view_id), 0) as total_views,
          COALESCE(COUNT(DISTINCT b.borrow_id), 0) as times_borrowed
        FROM books
        LEFT JOIN book_views v ON books.book_id = v.book_id
        LEFT JOIN borrowing_records b ON books.book_id = b.book_id AND b.status IN ('returned', 'active', 'overdue')
        WHERE books.book_id = ?
      `, [bookId]);
      
      return stats.length > 0 ? stats[0] : { total_views: 0, times_borrowed: 0 };
    } catch (error) {
      console.error('Error getting book stats:', error);
      throw new DatabaseError(error.message);
    }
  }

  // Populate book_copies for existing books that don't have individual copies
  static async populateMissingCopies() {
    try {
      // Get books that have no copies in book_copies table
      const [booksWithoutCopies] = await pool.query(`
        SELECT b.book_id, b.total_copies 
        FROM books b
        WHERE b.book_id NOT IN (SELECT DISTINCT book_id FROM book_copies)
      `);

      if (booksWithoutCopies.length === 0) {
        console.log('✅ All books already have copies');
        return { created: 0 };
      }

      let totalCreated = 0;
      for (const book of booksWithoutCopies) {
        const numCopies = book.total_copies || 1;
        for (let i = 0; i < numCopies; i++) {
          await pool.query(
            'INSERT INTO book_copies (book_id, status) VALUES (?, ?)',
            [book.book_id, 'available']
          );
          totalCreated++;
        }
      }

      console.log(`✅ Populated ${totalCreated} missing copies for ${booksWithoutCopies.length} books`);
      return { created: totalCreated, bookCount: booksWithoutCopies.length };
    } catch (error) {
      console.error('Error populating copies:', error);
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = BookModel;
