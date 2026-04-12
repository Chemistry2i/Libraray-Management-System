const ReservationService = require('../services/ReservationService');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');

class ReservationController {
  // Create reservation
  static async createReservation(req, res, next) {
    try {
      const { bookId } = req.body;
      const userId = req.user.user_id;

      const reservationId = await ReservationService.createReservation(userId, bookId);
      sendSuccess(res, 'Book reserved successfully', { reservationId }, 201);
    } catch (error) {
      next(error);
    }
  }

  // Get user's reservations
  static async getMyReservations(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const userId = req.user.user_id;

      const { reservations, total } = await ReservationService.getUserReservations(userId, page, limit);
      sendPaginated(res, 'Your reservations retrieved', reservations, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  // Get all reservations (admin/librarian only)
  static async getAllReservations(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;

      const { reservations, total } = await ReservationService.getAllReservations(page, limit);
      sendPaginated(res, 'All reservations retrieved', reservations, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  // Cancel reservation (admin)
  static async adminCancelReservation(req, res, next) {
    try {
      const reservationId = req.params.id;
      await ReservationService.adminCancelReservation(reservationId);
      sendSuccess(res, 'Reservation cancelled');
    } catch (error) {
      next(error);
    }
  }

  // Cancel reservation
  static async cancelReservation(req, res, next) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.user_id;

      await ReservationService.cancelReservation(reservationId, userId);
      sendSuccess(res, 'Reservation cancelled');
    } catch (error) {
      next(error);
    }
  }

  // Get queue position for reservation (Greenstone-inspired)
  static async getQueuePosition(req, res, next) {
    try {
      const reservationId = req.params.id;
      const position = await ReservationService.getQueuePosition(reservationId);
      sendSuccess(res, 'Queue position retrieved', { position });
    } catch (error) {
      next(error);
    }
  }

  // Get pending reservation queue for a book (librarian only)
  static async getPendingQueue(req, res, next) {
    try {
      const { bookId } = req.params;
      const queue = await ReservationService.getPendingReservationQueue(bookId);
      sendSuccess(res, 'Pending reservation queue retrieved', { queue });
    } catch (error) {
      next(error);
    }
  }

  // Mark reservation as ready (librarian only)
  static async markReady(req, res, next) {
    try {
      const { reservationId } = req.body;
      await ReservationService.markReservationReady(reservationId);
      sendSuccess(res, 'Reservation marked as ready');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReservationController;
