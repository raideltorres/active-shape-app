import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WorkoutScreen from '../../screens/user/WorkoutScreen';
import WorkoutDetailScreen from '../../screens/user/WorkoutDetailScreen';

const Stack = createNativeStackNavigator();

const WorkoutStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
};

export default WorkoutStack;
