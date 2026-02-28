import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SubscriptionPlaceholderScreen from '../screens/onboarding/SubscriptionPlaceholderScreen';

const Stack = createNativeStackNavigator();

const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="SubscriptionPlaceholder"
        component={SubscriptionPlaceholderScreen}
      />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
