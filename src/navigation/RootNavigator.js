import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import AuthStack from './AuthStack';
import MainStack from './MainStack';
import OnboardingStack from './OnboardingStack';
import { useAuth } from '../hooks/useAuth';
import { useGetProfileQuery } from '../store/api';
import { colors } from '../theme';

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { data: profile, isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const onboardingFinished =
    profile?.onboarding?.finished === true &&
    profile?.onboarding?.onboardingStep >= 7;

  const renderStack = () => {
    if (!isAuthenticated) return <AuthStack />;

    if (isLoading && !profile) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      );
    }

    if (!onboardingFinished) return <OnboardingStack />;

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

