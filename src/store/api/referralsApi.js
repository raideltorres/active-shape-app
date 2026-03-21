import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReferralCode', 'ReferralStats', 'ReferralList', 'PayoutHistory', 'ConnectStatus'],
  endpoints: (builder) => ({
    getReferralCode: builder.query({
      query: () => '/referrals/code',
      providesTags: ['ReferralCode'],
    }),

    generateReferralCode: builder.mutation({
      query: () => ({
        url: '/referrals/code',
        method: 'POST',
      }),
      invalidatesTags: ['ReferralCode', 'ReferralStats'],
    }),

    setCustomSlug: builder.mutation({
      query: (slug) => ({
        url: '/referrals/code/slug',
        method: 'PUT',
        body: { slug },
      }),
      invalidatesTags: ['ReferralCode'],
    }),

    getReferralStats: builder.query({
      query: () => '/referrals/stats',
      providesTags: ['ReferralStats'],
    }),

    getReferralsList: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/referrals/list?page=${page}&limit=${limit}`,
      providesTags: ['ReferralList'],
    }),

    getPayoutHistory: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/referrals/payouts?page=${page}&limit=${limit}`,
      providesTags: ['PayoutHistory'],
    }),

    getPendingCommissions: builder.query({
      query: () => '/referrals/commissions',
    }),

    getTaxSummary: builder.query({
      query: () => '/referrals/tax-summary',
      providesTags: ['PayoutHistory'],
    }),

    setupStripeConnect: builder.mutation({
      query: () => ({
        url: '/referrals/connect/setup',
        method: 'POST',
      }),
      invalidatesTags: ['ConnectStatus'],
    }),

    getConnectStatus: builder.query({
      query: () => '/referrals/connect/status',
      providesTags: ['ConnectStatus'],
    }),

    requestPayout: builder.mutation({
      query: (amountCents) => ({
        url: '/referrals/payout/request',
        method: 'POST',
        body: { amountCents },
      }),
      invalidatesTags: ['ReferralStats', 'PayoutHistory'],
    }),
  }),
});

export const {
  useGetReferralCodeQuery,
  useGenerateReferralCodeMutation,
  useSetCustomSlugMutation,
  useGetReferralStatsQuery,
  useGetReferralsListQuery,
  useGetPayoutHistoryQuery,
  useGetPendingCommissionsQuery,
  useGetTaxSummaryQuery,
  useSetupStripeConnectMutation,
  useGetConnectStatusQuery,
  useRequestPayoutMutation,
} = referralsApi;
