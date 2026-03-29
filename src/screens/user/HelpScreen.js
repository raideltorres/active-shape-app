import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TabScreenLayout } from '../../components/templates';
import { colors, spacing, typography, borderRadius } from '../../theme';
import FaqTab from './FaqTab';
import BugReportsTab from './BugReportsTab';
import SuggestionsTab from './SuggestionsTab';

const TABS = [
  { key: 'faq', label: 'FAQ', icon: 'help-circle-outline' },
  { key: 'bugs', label: 'Bug Reports', icon: 'bug-outline' },
  { key: 'suggestions', label: 'Suggestions', icon: 'bulb-outline' },
];

const HelpScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <TabScreenLayout
      title="Help & Support"
      subtitle="Browse questions, report bugs, or share ideas."
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
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
              <Ionicons name={tab.icon} size={16} color={isActive ? colors.mainOrange : colors.raven} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'faq' && <FaqTab />}
      {activeTab === 'bugs' && <BugReportsTab />}
      {activeTab === 'suggestions' && <SuggestionsTab />}
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
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
});

export default HelpScreen;
