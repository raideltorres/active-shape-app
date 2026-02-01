import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeStack from './stacks/HomeStack';
import RecipesStack from './stacks/RecipesStack';
import WorkoutStack from './stacks/WorkoutStack';
import TrackingStack from './stacks/TrackingStack';
import ProfileStack from './stacks/ProfileStack';
import { AnimatedTabBar } from '../components/molecules';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="HomeTab"
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen 
        name="RecipesTab" 
        component={RecipesStack}
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen 
        name="TrackingTab" 
        component={TrackingStack}
        options={{ tabBarLabel: 'Track' }}
      />
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="WorkoutTab" 
        component={WorkoutStack}
        options={{ tabBarLabel: 'Workout' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
