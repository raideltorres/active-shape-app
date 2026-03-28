import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { getCurrentDate } from '../../utils/date';

const DailyInsightsCard = ({ 
  insights = null, 
  isLoading = false,
  isGenerated = false,
  isFailed = false,
  onGenerateInsights,
  hasTrackingData = false,
}) => {
  const navigation = useNavigation();
  const hasAttemptedGeneration = useRef(false);
  const todayStr = useMemo(() => getCurrentDate(), []);

  const needsNewInsights = !insights || insights.date !== todayStr;
  const generationDone = isGenerated || isFailed;

  useEffect(() => {
    if (
      needsNewInsights &&
      hasTrackingData &&
      !isLoading &&
      !generationDone &&
      onGenerateInsights &&
      !hasAttemptedGeneration.current
    ) {
      hasAttemptedGeneration.current = true;
      onGenerateInsights();
    }
  }, [needsNewInsights, hasTrackingData, isLoading, generationDone, onGenerateInsights]);

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

  if (!hasTrackingData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="analytics-outline" size={32} color={colors.raven} />
          </View>
          <Text style={styles.emptyTitle}>Daily Insights</Text>
          <Text style={styles.emptyDescription}>
            Start tracking your meals, weight, and activities to receive personalized AI insights about your progress.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.purple} />
          <Text style={styles.loadingText}>Analyzing your progress...</Text>
        </View>
      </View>
    );
  }

  if (needsNewInsights) {
    if (!generationDone) return null;

    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="sparkles-outline" size={32} color={colors.purple} />
          </View>
          <Text style={styles.emptyTitle}>Daily Insights</Text>
          <Text style={styles.emptyDescription}>
            Keep tracking throughout the day — your AI insights will be ready tomorrow based on today's data.
          </Text>
        </View>
      </View>
    );
  }

  const moodIcon = getMoodIcon(insights.mood);
  const hasDetailedInsights = insights.overallScore != null;

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
        {hasDetailedInsights ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{insights.overallScore}</Text>
          </View>
        ) : (
          <View style={[styles.moodBadge, { backgroundColor: `${moodIcon.color}15` }]}>
            <Ionicons name={moodIcon.name} size={16} color={moodIcon.color} />
          </View>
        )}
      </View>

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

      {insights.encouragement && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>{insights.encouragement}</Text>
        </View>
      )}

      {hasDetailedInsights && (
        <TouchableOpacity
          style={styles.reportBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('InsightsDetail')}
        >
          <Text style={styles.reportBtnText}>View Full Report</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
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
  scoreBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.mainBlue,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  reportBtnText: {
    ...typography.label,
    color: colors.white,
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
  encouragementContainer: {
    backgroundColor: `${colors.lima}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.lima,
  },
  encouragementText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 22,
    fontStyle: 'italic',
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
});

export default DailyInsightsCard;
