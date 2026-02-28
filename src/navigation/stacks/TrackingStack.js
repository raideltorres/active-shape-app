import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TrackingScreen from '../../screens/user/TrackingScreen';
import TrackingHistoryScreen from '../../screens/user/TrackingHistoryScreen';

const Stack = createNativeStackNavigator();

const TrackingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="TrackingHistory" component={TrackingHistoryScreen} />
    </Stack.Navigator>
  );
};

export default TrackingStack;
