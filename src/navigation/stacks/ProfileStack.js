import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../../screens/user/ProfileScreen';
import EditProfileScreen from '../../screens/user/EditProfileScreen';
import SettingsScreen from '../../screens/user/SettingsScreen';
import GoalsScreen from '../../screens/user/GoalsScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
