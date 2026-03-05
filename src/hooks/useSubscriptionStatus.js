import { useMemo } from 'react';

import { useGetProfileQuery, useGetCurrentSubscriptionQuery } from '../store/api';
import { bypassesPlanRestrictions } from '../utils/constants';

const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Hook to check user's subscription status.
 * Mirrors the web `use-subscription-status.js` logic.
 */
export const useSubscriptionStatus = () => {
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !profile?.stripeCustomerId,
  });

  return useMemo(() => {
    const isLoading = profileLoading || (profile?.stripeCustomerId && subscriptionLoading);
    const bypasses = bypassesPlanRestrictions(profile?.role);
    const hasActiveSubscription = subscription && ACTIVE_STATUSES.includes(subscription.status);
    const isTrialing = subscription?.status === 'trialing';
    const canAccessPaidFeatures = bypasses || !!hasActiveSubscription;
    const planLevel = subscription?.planId?.level ?? null;

    return {
      isLoading,
      hasActiveSubscription: !!hasActiveSubscription,
      isTrialing,
      bypassesRestrictions: bypasses,
      canAccessPaidFeatures,
      subscription: subscription ?? null,
      plan: subscription?.planId ?? null,
      planLevel,
      subscriptionError,
    };
  }, [profile, subscription, profileLoading, subscriptionLoading, subscriptionError]);
};
