const BookService = require('../services/BookService');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');

class BookController {
  static async getBooks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      
      const { books, total } = await BookService.getAllBooks(page, limit);
      sendPaginated(res, 'Books retrieved', books, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  static async searchBooks(req, res, next) {
    try {
      const { q } = req.query;
      const books = await BookService.searchBooks(q);
      sendSuccess(res, `Found ${books.length} results`, { books });
    } catch (error) {
      next(error);
    }
  }

  static async getBook(req, res, next) {
    try {
      // Get user ID from JWT if authenticated, otherwise null
      const userId = req.user?.user_id || null;
      const book = await BookService.getBookById(req.params.id, userId);
      sendSuccess(res, 'Book retrieved', { book });
    } catch (error) {
      next(error);
    }
  }

  static async createBook(req, res, next) {
    try {
      // Multipart/form-data sends everything as strings. Parse numbers explicitly.
      const bookData = { 
        ...req.body,
        category_id: parseInt(req.body.category_id),
        publication_year: req.body.publication_year ? parseInt(req.body.publication_year) : null,
        total_copies: parseInt(req.body.copies),
        available_copies: parseInt(req.body.available)
      };

      if (req.files?.cover) {
        bookData.cover_url = `/uploads/books/${req.files.cover[0].filename}`;
      }
      if (req.files?.book_file) {
        bookData.book_file_url = `/uploads/books/${req.files.book_file[0].filename}`;
      }

      const bookId = await BookService.createBook(bookData);
      sendSuccess(res, 'Book added', { bookId }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    try {
      await BookService.updateBook(req.params.id, req.body);
      sendSuccess(res, 'Book updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      await BookService.deleteBook(req.params.id);
      sendSuccess(res, 'Book deleted');
    } catch (error) {
      next(error);
    }
  }

  static async downloadBook(req, res, next) {
    try {
      const book = await BookService.getBookById(req.params.id);
      
      if (!book?.book_file_url) {
        return sendError(res, 'Book file not available', 404);
      }

      const path = require('path');
      const fs = require('fs');
      
      // Extract filename from URL path
      const filename = book.book_file_url.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/books', filename);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        console.error('File not found at:', filepath);
        return sendError(res, 'Book file not found on server', 404);
      }

      // Get file stats
      const stats = fs.statSync(filepath);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${book.title || 'book'}.pdf"`);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      // Stream the file
      const stream = fs.createReadStream(filepath);
      stream.pipe(res);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error downloading file' });
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      next(error);
    }
  }
}

module.exports = BookController;
