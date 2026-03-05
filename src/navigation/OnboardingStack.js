import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import PlanGenerationScreen from '../screens/onboarding/PlanGenerationScreen';
import PricingScreen from '../screens/pricing/PricingScreen';

const Stack = createNativeStackNavigator();

const OnboardingStack = ({ initialRouteName = 'Onboarding' }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="PlanGeneration" component={PlanGenerationScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
