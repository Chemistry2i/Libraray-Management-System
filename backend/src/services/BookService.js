const BookModel = require('../models/BookModel');
const { NotFoundError } = require('../exceptions/AppError');
const { DEFAULT_LIMIT, DEFAULT_PAGE } = require('../constants/appConstants');

class BookService {
  static async getAllBooks(page, limit) {
    const offset = (page - 1) * limit;
    const result = await BookModel.findAll(limit, offset);
    return result;
  }

  static async searchBooks(query) {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    const books = await BookModel.search(query);
    return books;
  }

  static async getBookById(bookId, userId = null) {
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    
    // Track view asynchronously (don't wait for it)
    BookModel.recordView(bookId, userId).catch(err => console.error('Failed to record view:', err));
    
    // Get stats for the book
    const stats = await BookModel.getBookStats(bookId);
    
    return {
      ...book,
      total_views: stats.total_views,
      times_borrowed: stats.times_borrowed
    };
  }

  static async createBook(bookData) {
    const bookId = await BookModel.create(bookData);
    return bookId;
  }

  static async updateBook(bookId, updateData) {
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    await BookModel.update(bookId, updateData);
    return true;
  }

  static async deleteBook(bookId) {
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    await BookModel.delete(bookId);
    return true;
  }
}

module.exports = BookService;
