import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeStack from './stacks/HomeStack';
import RecipesStack from './stacks/RecipesStack';
import WorkoutStack from './stacks/WorkoutStack';
import TrackingStack from './stacks/TrackingStack';
import PlanStack from './stacks/PlanStack';
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
        name="PlanTab" 
        component={PlanStack}
        options={{ tabBarLabel: 'My Plan' }}
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
        name="RecipesTab" 
        component={RecipesStack}
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen 
        name="WorkoutTab" 
        component={WorkoutStack}
        options={{ tabBarLabel: 'Workout' }}
      />
      {/* Profile is accessed from dashboard header, not shown in tab bar */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
