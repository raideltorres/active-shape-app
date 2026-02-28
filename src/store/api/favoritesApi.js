import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';
import { usersApi } from './usersApi';

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    addRecipeFavorite: builder.mutation({
      query: (recipeId) => ({
        url: `${API_ENDPOINTS.USERS}/recipe-favorite-add/${recipeId}`,
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(usersApi.util.invalidateTags(['Profile']));
      },
    }),

    removeRecipeFavorite: builder.mutation({
      query: (recipeId) => ({
        url: `${API_ENDPOINTS.USERS}/recipe-favorite-remove/${recipeId}`,
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(usersApi.util.invalidateTags(['Profile']));
      },
    }),
  }),
});

export const {
  useAddRecipeFavoriteMutation,
  useRemoveRecipeFavoriteMutation,
} = favoritesApi;
