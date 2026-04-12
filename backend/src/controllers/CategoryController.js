const CategoryService = require('../services/CategoryService');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../constants/appConstants');

class CategoryController {
  // Get all categories
  static async getCategories(req, res, next) {
    try {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;

      const { categories, total } = await CategoryService.getAllCategories(page, limit);
      sendPaginated(res, 'Categories retrieved', categories, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  // Get category by ID
  static async getCategory(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      sendSuccess(res, 'Category retrieved', { category });
    } catch (error) {
      next(error);
    }
  }

  // Create category
  static async createCategory(req, res, next) {
    try {
      const categoryId = await CategoryService.createCategory(req.body);
      sendSuccess(res, 'Category created', { categoryId }, 201);
    } catch (error) {
      next(error);
    }
  }

  // Update category
  static async updateCategory(req, res, next) {
    try {
      await CategoryService.updateCategory(req.params.id, req.body);
      sendSuccess(res, 'Category updated');
    } catch (error) {
      next(error);
    }
  }

  // Delete category
  static async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      sendSuccess(res, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }

  // Get popular categories (Greenstone-inspired discovery)
  static async getPopularCategories(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const categories = await CategoryService.getPopularCategories(limit);
      sendSuccess(res, 'Popular categories retrieved', { categories });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
