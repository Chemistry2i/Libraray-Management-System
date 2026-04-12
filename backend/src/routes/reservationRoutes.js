const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');
const { authenticate, authorize } = require('../middleware/auth');
const { reservationValidator } = require('../validators/validators');
const { ROLES } = require('../constants/appConstants');

// Member routes (authenticated)
router.post('/', authenticate, reservationValidator, ReservationController.createReservation);
router.get('/my', authenticate, ReservationController.getMyReservations);
router.delete('/:id', authenticate, ReservationController.cancelReservation);
router.get('/:id/queue-position', authenticate, ReservationController.getQueuePosition);

// Admin/Librarian routes
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReservationController.getAllReservations);
router.post('/queue/:bookId', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReservationController.getPendingQueue);
router.patch('/ready', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReservationController.markReady);
router.delete('/admin/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), ReservationController.adminCancelReservation);

module.exports = router;
