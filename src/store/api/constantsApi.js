import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export const constantsApi = createApi({
  reducerPath: 'constantsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAllConstants: builder.query({
      query: () => '/constants/all',
    }),
  }),
});

export const { useGetAllConstantsQuery } = constantsApi;
