import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PaymentMethods', 'Subscriptions', 'Invoices'],
  endpoints: (builder) => ({
    // ============= Setup Intent =============

    createSetupIntent: builder.mutation({
      query: () => ({
        url: API_ENDPOINTS.STRIPE_SETUP_CREATE_INTENT,
        method: 'POST',
      }),
    }),

    confirmSetupIntent: builder.mutation({
      query: (setupIntentId) => ({
        url: API_ENDPOINTS.STRIPE_SETUP_CONFIRM,
        method: 'POST',
        body: { setupIntentId },
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    // ============= Payment Methods =============

    getPaymentMethods: builder.query({
      query: () => API_ENDPOINTS.STRIPE_PAYMENT_METHODS,
      providesTags: ['PaymentMethods'],
      transformResponse: (response) => response.data || [],
    }),

    getDefaultPaymentMethod: builder.query({
      query: () => API_ENDPOINTS.STRIPE_PAYMENT_METHODS_DEFAULT,
      providesTags: ['PaymentMethods'],
      transformResponse: (response) => response.data || null,
    }),

    setDefaultPaymentMethod: builder.mutation({
      query: (paymentMethodId) => ({
        url: `${API_ENDPOINTS.STRIPE_PAYMENT_METHODS}/${paymentMethodId}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    deletePaymentMethod: builder.mutation({
      query: (paymentMethodId) => ({
        url: `${API_ENDPOINTS.STRIPE_PAYMENT_METHODS}/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    // ============= Subscriptions =============

    createSubscription: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.STRIPE_SUBSCRIPTIONS,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    getCurrentSubscription: builder.query({
      query: () => API_ENDPOINTS.STRIPE_SUBSCRIPTIONS_CURRENT,
      providesTags: ['Subscriptions'],
      transformResponse: (response) => response.data,
    }),

    updateSubscription: builder.mutation({
      query: ({ subscriptionId, ...body }) => ({
        url: `${API_ENDPOINTS.STRIPE_SUBSCRIPTIONS}/${subscriptionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    cancelSubscription: builder.mutation({
      query: ({ subscriptionId, ...body }) => ({
        url: `${API_ENDPOINTS.STRIPE_SUBSCRIPTIONS}/${subscriptionId}`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    resumeSubscription: builder.mutation({
      query: (subscriptionId) => ({
        url: `${API_ENDPOINTS.STRIPE_SUBSCRIPTIONS}/${subscriptionId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // ============= Invoices =============

    getInvoices: builder.query({
      query: ({ limit = 10, startingAfter } = {}) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (startingAfter) {
          params.append('starting_after', startingAfter);
        }
        return `${API_ENDPOINTS.STRIPE_INVOICES}?${params.toString()}`;
      },
      providesTags: ['Invoices'],
    }),
  }),
});

export const {
  useCreateSetupIntentMutation,
  useConfirmSetupIntentMutation,
  useGetPaymentMethodsQuery,
  useLazyGetPaymentMethodsQuery,
  useGetDefaultPaymentMethodQuery,
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useCreateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetInvoicesQuery,
} = stripeApi;
