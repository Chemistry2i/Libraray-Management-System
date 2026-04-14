/**
 * Generic client-side search utility
 * Use this across the app for consistent search/filter behavior
 */

/**
 * Filter array by search term across multiple fields
 * @param {Array} items - Items to filter
 * @param {String} searchTerm - Search query
 * @param {Array} searchFields - Fields to search in (e.g., ['title', 'author'])
 * @returns {Array} - Filtered items
 */
export const filterBySearch = (items, searchTerm, searchFields = []) => {
  if (!searchTerm.trim() || searchFields.length === 0) {
    return items;
  }

  const searchLower = searchTerm.toLowerCase();
  return items.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(searchLower);
    })
  );
};

/**
 * Sort array by a field
 * @param {Array} items - Items to sort
 * @param {String} sortField - Field to sort by
 * @param {String} sortOrder - 'asc' or 'desc'
 * @returns {Array} - Sorted items
 */
export const sortByField = (items, sortField, sortOrder = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Handle dates
    if (aVal instanceof Date || bVal instanceof Date) {
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    return sortOrder === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  return sorted;
};

/**
 * Combine search and filter operations
 * @param {Array} items - Items to process
 * @param {Object} filters - Filter configuration
 * @returns {Array} - Filtered and sorted items
 */
export const applyFilters = (items, filters = {}) => {
  const {
    searchTerm = '',
    searchFields = [],
    filterBy = {}, // e.g., { status: 'active', category_id: 1 }
    sortField = null,
    sortOrder = 'asc'
  } = filters;

  let result = [...items];

  // Apply search
  if (searchTerm.trim() && searchFields.length > 0) {
    result = filterBySearch(result, searchTerm, searchFields);
  }

  // Apply filters
  Object.keys(filterBy).forEach(key => {
    const value = filterBy[key];
    if (value !== null && value !== undefined && value !== '') {
      result = result.filter(item => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    }
  });

  // Apply sort
  if (sortField) {
    result = sortByField(result, sortField, sortOrder);
  }

  return result;
};

export default {
  filterBySearch,
  sortByField,
  applyFilters
};
