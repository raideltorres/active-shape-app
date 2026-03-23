import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

import { NavigationContainer } from '@react-navigation/native';

import AuthStack from './AuthStack';
import MainStack from './MainStack';
import OnboardingStack from './OnboardingStack';
import { useAuth } from '../hooks/useAuth';
import { useGetProfileQuery } from '../store/api';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { captureReferralFromURL } from '../utils/referral';
import { colors } from '../theme';

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    Linking.getInitialURL().then(captureReferralFromURL);
    const sub = Linking.addEventListener('url', (event) => captureReferralFromURL(event.url));
    return () => sub.remove();
  }, []);
  const { data: profile, isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { canAccessPaidFeatures, isLoading: subscriptionLoading } = useSubscriptionStatus();

  const onboardingFinished =
    profile?.onboarding?.finished === true &&
    profile?.onboarding?.onboardingStep >= 7 &&
    !!profile?.personalizedPlan;

  const renderStack = () => {
    if (!isAuthenticated) return <AuthStack />;

    if ((isLoading && !profile) || (isAuthenticated && subscriptionLoading && !profile)) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      );
    }

    if (!onboardingFinished) return <OnboardingStack />;
    if (!canAccessPaidFeatures) return <OnboardingStack initialRouteName="Pricing" />;

    return <MainStack />;
  };

  return <NavigationContainer>{renderStack()}</NavigationContainer>;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default RootNavigator;

