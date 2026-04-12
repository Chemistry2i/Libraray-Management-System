const CategoryModel = require('../models/CategoryModel');
const { NotFoundError, ConflictError } = require('../exceptions/AppError');
const { DEFAULT_LIMIT, DEFAULT_PAGE } = require('../constants/appConstants');

class CategoryService {
  // Get all categories with book count
  static async getAllCategories(page, limit) {
    const offset = (page - 1) * limit;
    const result = await CategoryModel.findAll(limit, offset);
    return result;
  }

  // Get category by ID
  static async getCategoryById(categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  // Create category (Greenstone-inspired: rich metadata support)
  static async createCategory(categoryData) {
    // Check if category name already exists
    const existing = await CategoryModel.findByName(categoryData.category_name);
    if (existing) {
      throw new ConflictError('Category name already exists');
    }

    const categoryId = await CategoryModel.create(categoryData);
    return categoryId;
  }

  // Update category
  static async updateCategory(categoryId, updateData) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if new name conflicts with existing
    if (updateData.category_name && updateData.category_name !== category.category_name) {
      const existing = await CategoryModel.findByName(updateData.category_name);
      if (existing) {
        throw new ConflictError('Category name already exists');
      }
    }

    await CategoryModel.update(categoryId, updateData);
    return true;
  }

  // Delete category
  static async deleteCategory(categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await CategoryModel.delete(categoryId);
    return true;
  }

  // Get popular categories (KYU Space-inspired: usage statistics)
  static async getPopularCategories(limit = 5) {
    const categories = await CategoryModel.getPopularCategories(limit);
    return categories;
  }
}

module.exports = CategoryService;
