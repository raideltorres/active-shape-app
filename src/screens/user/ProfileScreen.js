import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TabScreenLayout } from '../../components/templates';
import { colors, spacing, typography, borderRadius } from '../../theme';

import MyInfoTab from './profile/MyInfoTab';
import FastingTab from './profile/FastingTab';
import RecipesTab from './profile/RecipesTab';

const TABS = [
  { key: 'info', label: 'My Info', icon: 'person-outline' },
  { key: 'fasting', label: 'Fasting', icon: 'timer-outline' },
  { key: 'recipes', label: 'Recipes', icon: 'restaurant-outline' },
];

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <TabScreenLayout title="Profile" showProfileButton={false} keyboardAvoiding={activeTab === 'recipes'}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? colors.mainOrange : colors.raven}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'info' && <MyInfoTab navigation={navigation} />}
      {activeTab === 'fasting' && <FastingTab />}
      {activeTab === 'recipes' && <RecipesTab />}

      <View style={{ height: spacing.xxl }} />
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: `${colors.mainOrange}10`,
  },
  tabLabel: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
});

export default ProfileScreen;
