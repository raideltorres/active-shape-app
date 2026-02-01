import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WorkoutScreen from '../../screens/user/WorkoutScreen';

const Stack = createNativeStackNavigator();

const WorkoutStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workout" component={WorkoutScreen} />
    </Stack.Navigator>
  );
};

export default WorkoutStack;
