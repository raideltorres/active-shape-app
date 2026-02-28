import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../../screens/user/DashboardScreen';
import FastingHistoryScreen from '../../screens/fasting/FastingHistoryScreen';
import FastingCalendarScreen from '../../screens/fasting/FastingCalendarScreen';
import FastingStatsScreen from '../../screens/fasting/FastingStatsScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="FastingHistory" component={FastingHistoryScreen} />
      <Stack.Screen name="FastingCalendar" component={FastingCalendarScreen} />
      <Stack.Screen name="FastingStats" component={FastingStatsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;
