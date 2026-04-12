const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

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
      const { title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, book_file_url } = bookData;
      console.log('DEBUG: BookModel.create bookData:', bookData);
      
      // Start transaction
      await connection.beginTransaction();

      // Insert book record
      const [result] = await connection.query(
        'INSERT INTO books (title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, book_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, isbn, category_id, publication_year, publisher, description, total_copies, available_copies, cover_url, book_file_url]
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
    try {
      const { title, author, category_id, publication_year, publisher, description } = updateData;
      await pool.query(
        'UPDATE books SET title = ?, author = ?, category_id = ?, publication_year = ?, publisher = ?, description = ? WHERE book_id = ?',
        [title, author, category_id, publication_year, publisher, description, bookId]
      );
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
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
