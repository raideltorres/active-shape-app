import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const DailyInsightsCard = ({ 
  insights = null, 
  isLoading = false, 
  onGenerateInsights,
  hasTrackingData = false,
}) => {
  // Check if insights are from today
  const isInsightsFromToday = () => {
    if (!insights?.date) return false;
    const insightsDate = new Date(insights.date).toDateString();
    const today = new Date().toDateString();
    return insightsDate === today;
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'positive':
        return { name: 'happy-outline', color: colors.lima };
      case 'neutral':
        return { name: 'cafe-outline', color: colors.mainOrange };
      case 'attention':
        return { name: 'alert-circle-outline', color: colors.cinnabar };
      default:
        return { name: 'sparkles-outline', color: colors.purple };
    }
  };

  // No tracking data - show prompt to start tracking
  if (!hasTrackingData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="analytics-outline" size={32} color={colors.raven} />
          </View>
          <Text style={styles.emptyTitle}>No Insights Yet</Text>
          <Text style={styles.emptyDescription}>
            Start tracking your meals and activities to receive personalized AI insights
          </Text>
        </View>
      </View>
    );
  }

  // Has tracking but no insights or outdated insights
  if (!insights || !isInsightsFromToday()) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.purple}15` }]}>
              <Ionicons name="sparkles" size={20} color={colors.purple} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Daily Insights</Text>
              <Text style={styles.subtitle}>AI-powered recommendations</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.purple} />
            <Text style={styles.loadingText}>Generating insights...</Text>
          </View>
        ) : (
          <View style={styles.generatePrompt}>
            <Text style={styles.generateText}>
              Generate personalized insights based on your recent tracking data
            </Text>
            <TouchableOpacity style={styles.generateButton} onPress={onGenerateInsights}>
              <Ionicons name="sparkles" size={16} color={colors.white} />
              <Text style={styles.generateButtonText}>Generate Insights</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  const moodIcon = getMoodIcon(insights.mood);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.purple}15` }]}>
            <Ionicons name="sparkles" size={20} color={colors.purple} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daily Insights</Text>
            <Text style={styles.subtitle}>AI-powered recommendations</Text>
          </View>
        </View>
        <View style={[styles.moodBadge, { backgroundColor: `${moodIcon.color}15` }]}>
          <Ionicons name={moodIcon.name} size={16} color={moodIcon.color} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.purple} />
          <Text style={styles.loadingText}>Generating insights...</Text>
        </View>
      ) : (
        <>
          {insights.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>{insights.summary}</Text>
            </View>
          )}

          {insights.tips && insights.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for today</Text>
              {insights.tips.slice(0, 3).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipBullet}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.lima} />
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {onGenerateInsights && (
            <TouchableOpacity style={styles.refreshButton} onPress={onGenerateInsights}>
              <Ionicons name="refresh-outline" size={16} color={colors.purple} />
              <Text style={styles.refreshButtonText}>Refresh Insights</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  subtitle: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: `${colors.purple}08`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
  },
  summaryText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 22,
  },
  tipsContainer: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  tipBullet: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    marginTop: spacing.sm,
  },
  refreshButtonText: {
    ...typography.bodySmall,
    color: colors.purple,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  generatePrompt: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  generateText: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  generateButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default DailyInsightsCard;
