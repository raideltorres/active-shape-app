import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlanScreen from '../../screens/user/PlanScreen';

const Stack = createNativeStackNavigator();

const PlanStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Plan" component={PlanScreen} />
    </Stack.Navigator>
  );
};

export default PlanStack;
