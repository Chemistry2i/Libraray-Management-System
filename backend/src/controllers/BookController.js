const BookService = require('../services/BookService');
const DigitalCollectionStorageService = require('../services/DigitalCollectionStorageService');
const fs = require('fs');
const path = require('path');
const { getUploadDirectory } = require('../utils/uploadDirectories');
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
    let storedCover;
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
        storedCover = await DigitalCollectionStorageService.storeBookCover(req.files.cover[0]);
        bookData.cover_url = storedCover.url;
        bookData.cover_cloudinary_public_id = storedCover.publicId;
      }
      if (req.files?.book_file) {
        bookData.book_file_url = `/uploads/books/${req.files.book_file[0].filename}`;
      }

      const bookId = await BookService.createBook(bookData);
      if (storedCover?.provider === 'cloudinary') {
        await fs.promises.rm(req.files.cover[0].path, { force: true });
      }
      sendSuccess(res, 'Book added', { bookId }, 201);
    } catch (error) {
      if (storedCover?.publicId) {
        await DigitalCollectionStorageService.deleteBookCover(storedCover.publicId).catch(() => {});
      }
      for (const file of Object.values(req.files || {}).flat()) {
        await fs.promises.rm(file.path, { force: true }).catch(() => {});
      }
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    let storedCover;
    try {
      const currentBook = await BookService.getBookById(req.params.id);
      const bookData = { ...req.body };
      const coverFile = req.files?.cover?.[0];
      if (coverFile) {
        storedCover = await DigitalCollectionStorageService.storeBookCover(coverFile);
        bookData.cover_url = storedCover.url;
        bookData.cover_cloudinary_public_id = storedCover.publicId;
      }
      await BookService.updateBook(req.params.id, bookData);
      if (coverFile && storedCover?.provider === 'cloudinary') {
        await fs.promises.rm(coverFile.path, { force: true });
      }
      if (coverFile && currentBook.cover_cloudinary_public_id) {
        await DigitalCollectionStorageService.deleteBookCover(currentBook.cover_cloudinary_public_id)
          .catch((error) => console.error('Could not remove replaced Cloudinary cover:', error.message));
      }
      sendSuccess(res, 'Book updated');
    } catch (error) {
      if (storedCover?.publicId) {
        await DigitalCollectionStorageService.deleteBookCover(storedCover.publicId).catch(() => {});
      }
      for (const file of Object.values(req.files || {}).flat()) {
        await fs.promises.rm(file.path, { force: true }).catch(() => {});
      }
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      const deletedBook = await BookService.deleteBook(req.params.id);
      if (deletedBook.cover_cloudinary_public_id) {
        await DigitalCollectionStorageService.deleteBookCover(deletedBook.cover_cloudinary_public_id)
          .catch((error) => console.error('Could not delete Cloudinary book cover:', error.message));
      }
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

      // Extract filename from URL path
      const filename = book.book_file_url.split('/').pop();
      const filepath = path.join(getUploadDirectory('books'), filename);
      
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
