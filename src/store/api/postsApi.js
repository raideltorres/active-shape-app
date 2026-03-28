import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (params = {}) => ({
        url: '/posts',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
          ...(params.tag && { tag: params.tag }),
          ...(params.category && { category: params.category }),
        },
      }),
      providesTags: ['Posts'],
    }),
    getPopularTags: builder.query({
      query: ({ limit = 11, recentPostsCount = 20 } = {}) => ({
        url: '/posts/popular-tags',
        params: { limit, recentPostsCount },
      }),
      providesTags: ['Posts'],
    }),
    getCategories: builder.query({
      query: () => '/posts/categories',
      providesTags: ['Posts'],
    }),
    getPostBySlug: builder.query({
      query: (slug) => `/posts/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Posts', id: slug }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPopularTagsQuery,
  useGetCategoriesQuery,
  useGetPostBySlugQuery,
} = postsApi;
