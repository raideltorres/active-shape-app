import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const recipesApi = createApi({
  reducerPath: 'recipesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Recipes', 'RecipeFilters'],
  endpoints: (builder) => ({
    searchRecipes: builder.query({
      query: (params = {}) => {
        const defaultFilters = {
          diet: '', type: '',
          minCalories: '', maxCalories: '',
          minCarbs: '', maxCarbs: '',
          minProtein: '', maxProtein: '',
          minFat: '', maxFat: '',
          minSaturatedFat: '', maxSaturatedFat: '',
          minFiber: '', maxFiber: '',
        };
        const defaultPagination = { pageSize: 20, page: 1 };
        const filters = { ...defaultFilters, ...params.filters };
        const pagination = { ...defaultPagination, ...params.pagination };
        const query = { filters, pagination };
        return `${API_ENDPOINTS.RECIPES_GET}?params=${encodeURIComponent(JSON.stringify(query))}`;
      },
      providesTags: ['Recipes'],
    }),

    getRecipeDetails: builder.query({
      query: (id) => API_ENDPOINTS.RECIPE_DETAILS(id),
    }),

    getUserRecipeFilters: builder.query({
      query: () => API_ENDPOINTS.RECIPES_USER_FILTERS,
      providesTags: ['RecipeFilters'],
    }),

    saveUserRecipeFilters: builder.mutation({
      query: (filters) => ({
        url: API_ENDPOINTS.RECIPES_USER_FILTERS,
        method: 'PUT',
        body: filters,
      }),
      invalidatesTags: ['RecipeFilters'],
    }),
  }),
});

export const {
  useSearchRecipesQuery,
  useLazySearchRecipesQuery,
  useGetRecipeDetailsQuery,
  useGetUserRecipeFiltersQuery,
  useLazyGetUserRecipeFiltersQuery,
  useSaveUserRecipeFiltersMutation,
} = recipesApi;
