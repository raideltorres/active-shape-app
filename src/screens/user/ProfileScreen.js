import React, { useState } from 'react';
import { View } from 'react-native';

import TabBar from '../../components/atoms/TabBar';
import { TabScreenLayout } from '../../components/templates';
import { spacing } from '../../theme';

import MyInfoTab from './profile/MyInfoTab';
import FastingTab from './profile/FastingTab';
import RecipesTab from './profile/RecipesTab';

const TABS = [
  { key: 'info', label: 'My Info', icon: 'person-outline', iconSize: 18 },
  { key: 'fasting', label: 'Fasting', icon: 'timer-outline', iconSize: 18 },
  { key: 'recipes', label: 'Recipes', icon: 'restaurant-outline', iconSize: 18 },
];

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <TabScreenLayout title="Profile" showProfileButton={false} keyboardAvoiding={activeTab === 'recipes'}>
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'info' && <MyInfoTab navigation={navigation} />}
      {activeTab === 'fasting' && <FastingTab />}
      {activeTab === 'recipes' && <RecipesTab />}

      <View style={{ height: spacing.xxl }} />
    </TabScreenLayout>
  );
};

export default ProfileScreen;
