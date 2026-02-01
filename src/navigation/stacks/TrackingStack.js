import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TrackingScreen from '../../screens/user/TrackingScreen';

const Stack = createNativeStackNavigator();

const TrackingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tracking" component={TrackingScreen} />
    </Stack.Navigator>
  );
};

export default TrackingStack;
