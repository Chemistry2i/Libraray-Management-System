const pool = require('../config/database');
const { DatabaseError } = require('../exceptions/AppError');

class CategoryModel {
  // Get all categories
  static async findAll(limit, offset) {
    try {
      const [rows] = await pool.query(
        'SELECT c.*, COUNT(b.book_id) as book_count FROM categories c LEFT JOIN books b ON c.category_id = b.category_id GROUP BY c.category_id LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const [count] = await pool.query('SELECT COUNT(*) as total FROM categories');
      return { categories: rows, total: count[0].total };
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get by ID
  static async findById(categoryId) {
    try {
      const [rows] = await pool.query(
        'SELECT c.*, COUNT(b.book_id) as book_count FROM categories c LEFT JOIN books b ON c.category_id = b.category_id WHERE c.category_id = ? GROUP BY c.category_id',
        [categoryId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get by name
  static async findByName(categoryName) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE category_name = ?',
        [categoryName]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Create category (Greenstone-inspired: rich metadata)
  static async create(categoryData) {
    try {
      const { category_name, description } = categoryData;
      const [result] = await pool.query(
        'INSERT INTO categories (category_name, description) VALUES (?, ?)',
        [category_name, description]
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Update category
  static async update(categoryId, updateData) {
    try {
      const { category_name, description } = updateData;
      await pool.query(
        'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
        [category_name, description, categoryId]
      );
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Delete category
  static async delete(categoryId) {
    try {
      await pool.query('DELETE FROM categories WHERE category_id = ?', [categoryId]);
      return true;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }

  // Get popular categories by borrowed books (KYU Space: usage statistics)
  static async getPopularCategories(limit = 5) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*, 
                COUNT(b.book_id) as total_books,
                COUNT(br.borrow_id) as times_borrowed
         FROM categories c 
         LEFT JOIN books b ON c.category_id = b.category_id
         LEFT JOIN borrowing_records br ON b.book_id = br.book_id
         GROUP BY c.category_id
         ORDER BY times_borrowed DESC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError(error.message);
    }
  }
}

module.exports = CategoryModel;
