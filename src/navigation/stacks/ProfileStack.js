import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../../screens/user/ProfileScreen';
import EditProfileScreen from '../../screens/user/EditProfileScreen';
import SettingsScreen from '../../screens/user/SettingsScreen';
import GoalsScreen from '../../screens/user/GoalsScreen';
import ReferralsScreen from '../../screens/user/ReferralsScreen';
import SubscriptionScreen from '../../screens/pricing/SubscriptionScreen';
import PaymentMethodsScreen from '../../screens/pricing/PaymentMethodsScreen';
import InvoicesScreen from '../../screens/pricing/InvoicesScreen';
import ChangePlanScreen from '../../screens/pricing/ChangePlanScreen';
import HelpScreen from '../../screens/user/HelpScreen';
import ChangePasswordScreen from '../../screens/user/ChangePasswordScreen';
import BlogScreen from '../../screens/blog/BlogScreen';
import BlogPostScreen from '../../screens/blog/BlogPostScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="ChangePlan" component={ChangePlanScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="BlogPost" component={BlogPostScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
