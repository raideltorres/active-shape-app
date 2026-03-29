import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import CardHeader from './CardHeader';
import { EmptyState } from '../atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
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
        <EmptyState
          icon="analytics-outline"
          iconSize={32}
          iconColor={colors.raven}
          title="Daily Insights"
          description="Start tracking your meals, weight, and activities to receive personalized AI insights about your progress."
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CardHeader
          icon="sparkles"
          iconColor={colors.purple}
          title="Daily Insights"
          subtitle="AI-powered recommendations"
        />
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
        <EmptyState
          icon="sparkles-outline"
          iconSize={32}
          iconColor={colors.purple}
          title="Daily Insights"
          description="Keep tracking throughout the day — your AI insights will be ready tomorrow based on today's data."
        />
      </View>
    );
  }

  const moodIcon = getMoodIcon(insights.mood);
  const hasDetailedInsights = insights.overallScore != null;

  return (
    <View style={styles.container}>
      <CardHeader
        icon="sparkles"
        iconColor={colors.purple}
        title="Daily Insights"
        subtitle="AI-powered recommendations"
        rightElement={hasDetailedInsights ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{insights.overallScore}</Text>
          </View>
        ) : (
          <View style={[styles.moodBadge, { backgroundColor: `${moodIcon.color}15` }]}>
            <Ionicons name={moodIcon.name} size={16} color={moodIcon.color} />
          </View>
        )}
      />

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
    ...shadows.card,
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
});

export default DailyInsightsCard;
