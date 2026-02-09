import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

const defaultPagination = { pageSize: 20, page: 1 };
const defaultFilters = {
  diet: '',
  type: '',
  minCalories: '',
  maxCalories: '',
  minCarbs: '',
  maxCarbs: '',
  minProtein: '',
  maxProtein: '',
  minFat: '',
  maxFat: '',
  minSaturatedFat: '',
  maxSaturatedFat: '',
  minFiber: '',
  maxFiber: '',
};

/**
 * Search recipes with filters and pagination.
 * @param {{ filters?: object, pagination?: { pageSize: number, page: number } }} params
 * @returns {Promise<{ results: array, totalResults: number, offset: number, number: number }>}
 */
export async function searchRecipes(params = {}) {
  const filters = { ...defaultFilters, ...params.filters };
  const pagination = { ...defaultPagination, ...params.pagination };
  const query = { filters, pagination };
  const url = `${API_ENDPOINTS.RECIPES_GET}?params=${encodeURIComponent(JSON.stringify(query))}`;
  return apiClient.get(url);
}

/**
 * Get recipe details by ID.
 * @param {string} id - Recipe ID
 * @returns {Promise<object>}
 */
export async function getRecipeDetails(id) {
  return apiClient.get(API_ENDPOINTS.RECIPE_DETAILS(id));
}

/**
 * Get user's saved recipe filters or smart defaults.
 * @returns {Promise<{ filters: object, source?: string }>}
 */
export async function getUserRecipeFilters() {
  return apiClient.get(API_ENDPOINTS.RECIPES_USER_FILTERS);
}

/**
 * Save user's recipe filters.
 * @param {object} filters
 * @returns {Promise<object>}
 */
export async function saveUserRecipeFilters(filters) {
  return apiClient.put(API_ENDPOINTS.RECIPES_USER_FILTERS, filters);
}

export const recipesService = {
  searchRecipes,
  getRecipeDetails,
  getUserRecipeFilters,
  saveUserRecipeFilters,
};
