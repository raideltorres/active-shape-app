import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_BASE_URL } from '../../services/api/config';
import { storage } from '../../utils/storage';

const formDataBaseQuery = async ({ url, body }) => {
  const token = await storage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body,
    });
    const data = await response.json();
    if (!response.ok) return { error: { status: response.status, data } };
    return { data };
  } catch (error) {
    return { error: { status: 'FETCH_ERROR', error: error.message } };
  }
};

export const helpApi = createApi({
  reducerPath: 'helpApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Faqs', 'BugReports', 'Suggestions'],
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: () => ({ url: '/help/faqs', method: 'GET' }),
      providesTags: ['Faqs'],
    }),

    createBugReport: builder.mutation({
      queryFn: async ({ title, description, category, screenshots = [] }) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (category) formData.append('category', category);
        screenshots.forEach((uri, i) => {
          const ext = uri.split('.').pop() || 'jpg';
          formData.append('screenshots', { uri, type: `image/${ext === 'jpg' ? 'jpeg' : ext}`, name: `screenshot_${i}.${ext}` });
        });
        return formDataBaseQuery({ url: '/help/bug-reports', body: formData });
      },
      invalidatesTags: ['BugReports'],
    }),

    getMyBugReports: builder.query({
      query: () => ({ url: '/help/bug-reports/my', method: 'GET' }),
      providesTags: ['BugReports'],
    }),

    deleteMyBugReport: builder.mutation({
      query: (id) => ({ url: `/help/bug-reports/my/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BugReports'],
    }),

    createSuggestion: builder.mutation({
      query: (body) => ({ url: '/help/suggestions', method: 'POST', body }),
      invalidatesTags: ['Suggestions'],
    }),

    getMySuggestions: builder.query({
      query: () => ({ url: '/help/suggestions/my', method: 'GET' }),
      providesTags: ['Suggestions'],
    }),

    toggleUpvote: builder.mutation({
      query: (id) => ({ url: `/help/suggestions/${id}/upvote`, method: 'POST' }),
      invalidatesTags: ['Suggestions'],
    }),

    deleteMySuggestion: builder.mutation({
      query: (id) => ({ url: `/help/suggestions/my/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Suggestions'],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateBugReportMutation,
  useGetMyBugReportsQuery,
  useDeleteMyBugReportMutation,
  useCreateSuggestionMutation,
  useGetMySuggestionsQuery,
  useToggleUpvoteMutation,
  useDeleteMySuggestionMutation,
} = helpApi;
