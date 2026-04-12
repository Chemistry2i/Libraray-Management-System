const ReservationModel = require('../models/ReservationModel');
const BookModel = require('../models/BookModel');
const BorrowingModel = require('../models/BorrowingModel');
const { NotFoundError, ConflictError, ValidationError } = require('../exceptions/AppError');
const { DEFAULT_LIMIT, DEFAULT_PAGE } = require('../constants/appConstants');

class ReservationService {
  // Create reservation (Greenstone-inspired: resource discovery & availability)
  static async createReservation(userId, bookId) {
    // Check if book exists
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    // Check if user already has active/pending reservation
    const hasReservation = await ReservationModel.hasExistingReservation(userId, bookId);
    if (hasReservation) {
      throw new ConflictError('You already have a reservation for this book');
    }

    // If book is available, user should checkout instead
    if (book.available_copies > 0) {
      throw new ValidationError('This book is currently available. Please checkout instead.');
    }

    const reservationId = await ReservationModel.create({ user_id: userId, book_id: bookId });
    return reservationId;
  }

  // Get user's reservations
  static async getUserReservations(userId, page, limit) {
    const offset = (page - 1) * limit;
    const result = await ReservationModel.findByUserId(userId, limit, offset);
    return result;
  }

  // Get all reservations (admin/librarian only)
  static async getAllReservations(page, limit) {
    const offset = (page - 1) * limit;
    const result = await ReservationModel.findAll(limit, offset);
    return result;
  }

  // Cancel reservation
  static async cancelReservation(reservationId, userId) {
    const reservation = await ReservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    // Check ownership (user can only cancel their own)
    if (reservation.user_id !== userId) {
      throw new ValidationError('You can only cancel your own reservations');
    }

    if (reservation.status === 'cancelled') {
      throw new ValidationError('Reservation already cancelled');
    }

    await ReservationModel.cancel(reservationId);
    return true;
  }

  // Get queue position for reservation (Greenstone-inspired queue management)
  static async getQueuePosition(reservationId) {
    const position = await ReservationModel.getQueuePosition(reservationId);
    if (position === null) {
      throw new NotFoundError('Reservation not found');
    }
    return position;
  }

  // Get pending reservations queue for a book (for librarian to process)
  static async getPendingReservationQueue(bookId) {
    const queue = await ReservationModel.getPendingReservationsForBook(bookId);
    return queue;
  }

  // Mark reservation as ready (when book becomes available)
  static async markReservationReady(reservationId) {
    const reservation = await ReservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (reservation.status !== 'pending') {
      throw new ValidationError('Only pending reservations can be marked as ready');
    }

    await ReservationModel.updateStatus(reservationId, 'ready');
    return true;
  }
}

module.exports = ReservationService;
