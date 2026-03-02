import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export const ingredientsApi = createApi({
  reducerPath: 'ingredientsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    autocompleteIngredients: builder.mutation({
      query: (query) => ({
        url: 'ingredients/autocomplete',
        method: 'GET',
        params: { query },
      }),
    }),
  }),
});

export const { useAutocompleteIngredientsMutation } = ingredientsApi;
