import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../../theme';

/**
 * Layout for screens within the bottom tab navigator
 * Handles SafeAreaView, header, and bottom padding for tab bar
 * 
 * @param {React.ReactNode} children - Screen content
 * @param {string} title - Header title (optional)
 * @param {string} subtitle - Header subtitle (optional)
 * @param {string} greeting - Greeting text above title (for dashboard style, optional)
 * @param {boolean} showHeader - Whether to show header (default: true if title provided)
 * @param {boolean} showProfileButton - Whether to show profile button (default: true)
 * @param {Object} contentContainerStyle - Additional styles for ScrollView content
 * @param {string} backgroundColor - Override background color (defaults to alabaster)
 * @param {boolean} scrollable - Whether content should scroll (default: true)
 * @param {boolean} refreshing - Pull-to-refresh state
 * @param {Function} onRefresh - Pull-to-refresh handler
 * @param {Array} edges - SafeAreaView edges (default: ['top'])
 */
const TabScreenLayout = ({ 
  children, 
  title,
  subtitle,
  greeting,
  showHeader = true,
  showProfileButton = true,
  contentContainerStyle,
  backgroundColor = colors.alabaster,
  scrollable = true,
  refreshing = false,
  onRefresh,
  edges = ['top'],
}) => {
  const navigation = useNavigation();

  const renderHeader = () => {
    if (!showHeader || !title) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {greeting && <Text style={styles.headerGreeting}>{greeting}</Text>}
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {showProfileButton && (
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation?.navigate?.('ProfileTab')}
          >
            <Ionicons name="person-circle-outline" size={40} color={colors.mainOrange} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
        <View style={[styles.content, contentContainerStyle]}>
          {renderHeader()}
          {children}
        </View>
        <View style={styles.tabBarSpacer} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={colors.mainOrange} 
            />
          ) : undefined
        }
      >
        {renderHeader()}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  tabBarSpacer: {
    height: spacing.tabBarPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    ...typography.body,
    color: colors.raven,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.mineShaft,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
});

export default TabScreenLayout;
