const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { authenticate, authorize } = require('../middleware/auth');
const { categoryValidator } = require('../validators/validators');
const { ROLES } = require('../constants/appConstants');

// Public Routes
router.get('/', CategoryController.getCategories);
router.get('/popular', CategoryController.getPopularCategories);
router.get('/:id', CategoryController.getCategory);

// Protected Routes (Admin/Librarian only)
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), categoryValidator, CategoryController.createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), categoryValidator, CategoryController.updateCategory);

// Protected Routes (Admin only)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN), CategoryController.deleteCategory);

module.exports = router;
