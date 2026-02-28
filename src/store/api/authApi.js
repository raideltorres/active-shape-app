import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.SIGN_IN,
        method: 'POST',
        body: credentials,
      }),
    }),

    signUp: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.SIGN_UP,
        method: 'POST',
        body: userData,
      }),
    }),

    googleSignIn: builder.mutation({
      query: (token) => ({
        url: API_ENDPOINTS.GOOGLE_SIGN_IN,
        method: 'POST',
        body: { token },
      }),
    }),

    googleSignUp: builder.mutation({
      query: (token) => ({
        url: API_ENDPOINTS.GOOGLE_SIGN_UP,
        method: 'POST',
        body: { token },
      }),
    }),

    facebookSignIn: builder.mutation({
      query: (accessToken) => ({
        url: API_ENDPOINTS.FACEBOOK_SIGN_IN,
        method: 'POST',
        body: { accessToken },
      }),
    }),

    facebookSignUp: builder.mutation({
      query: (accessToken) => ({
        url: API_ENDPOINTS.FACEBOOK_SIGN_UP,
        method: 'POST',
        body: { accessToken },
      }),
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useGoogleSignInMutation,
  useGoogleSignUpMutation,
  useFacebookSignInMutation,
  useFacebookSignUpMutation,
} = authApi;
