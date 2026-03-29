import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { formatTimeTo12h } from '../../../utils/date';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const formatTimeWindow = (timeWindow) => {
  if (!timeWindow) return '';
  if (timeWindow.toLowerCase().includes('am') || timeWindow.toLowerCase().includes('pm')) {
    return timeWindow;
  }
  const parts = timeWindow.split(/\s*[-–]\s*/);
  if (parts.length === 2) {
    return `${formatTimeTo12h(parts[0])} – ${formatTimeTo12h(parts[1])}`;
  }
  return timeWindow;
};

/**
 * Meal Timing & Fasting section for Plan screen
 */
const MealTimingSection = ({ mealTimingPlan }) => {
  if (!mealTimingPlan?.fastingRecommendation) return null;

  const fastingHours = mealTimingPlan.fastingRecommendation.fastingHours || 18;
  const eatingHours = mealTimingPlan.fastingRecommendation.eatingHours || (24 - fastingHours);
  const fastingPercent = (fastingHours / 24) * 100;
  const eatingPercent = (eatingHours / 24) * 100;

  const eatingStart = mealTimingPlan.eatingWindow?.start;
  const eatingEnd = mealTimingPlan.eatingWindow?.end;

  return (
    <SectionCard title="Meal Timing & Fasting" icon="timer-outline" color={colors.mainOrange}>
      {/* Protocol Display */}
      <View style={styles.protocolContainer}>
        <Text style={styles.protocolLabel}>PROTOCOL</Text>
        <Text style={styles.protocolValue}>{fastingHours}:{eatingHours}</Text>
      </View>

      {/* Timeline Bar */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineBar}>
          <View style={[styles.fastingBar, { width: `${fastingPercent}%` }]}>
            <Text style={styles.barLabel}>Fast: {fastingHours}h</Text>
          </View>
          <View style={[styles.eatingBar, { width: `${eatingPercent}%` }]}>
            <Text style={styles.barLabel}>Feed: {eatingHours}h</Text>
          </View>
        </View>
        <View style={styles.timeMarkers}>
          <Text style={styles.timeMarker}>12 AM</Text>
          <Text style={styles.timeMarker}>6 AM</Text>
          <Text style={styles.timeMarker}>12 PM</Text>
          <Text style={styles.timeMarker}>6 PM</Text>
          <Text style={styles.timeMarker}>12 AM</Text>
        </View>
      </View>

      {/* Eating Window & Fasting Period */}
      {eatingStart && eatingEnd && (
        <View style={styles.windowContainer}>
          <View style={styles.windowItem}>
            <Text style={styles.windowLabel}>Eating Window</Text>
            <Text style={styles.windowValue}>
              {formatTimeTo12h(eatingStart)} – {formatTimeTo12h(eatingEnd)}
            </Text>
          </View>
          <View style={styles.windowItem}>
            <Text style={styles.windowLabel}>Fasting Period</Text>
            <Text style={styles.windowValue}>
              {formatTimeTo12h(eatingEnd)} – {formatTimeTo12h(eatingStart)}
            </Text>
          </View>
        </View>
      )}

      {/* Meal Schedule */}
      {mealTimingPlan.suggestedSchedule && mealTimingPlan.suggestedSchedule.length > 0 && (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Meal Schedule</Text>
          {mealTimingPlan.suggestedSchedule.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealTimeBadge}>
                <Ionicons name="time-outline" size={12} color={colors.white} />
                <Text style={styles.mealTimeBadgeText}>{formatTimeWindow(meal.timeWindow)}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.mealType}</Text>
                <Text style={styles.mealCalories}>{meal.calorieTarget} kcal</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  protocolContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  protocolLabel: {
    ...typography.caption,
    color: colors.raven,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  protocolValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.mineShaft,
  },
  timelineContainer: {
    marginBottom: spacing.lg,
  },
  timelineBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  fastingBar: {
    backgroundColor: colors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eatingBar: {
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  timeMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeMarker: {
    ...typography.caption,
    color: colors.raven,
    fontSize: 10,
  },
  windowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  windowItem: {
    alignItems: 'center',
  },
  windowLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: 4,
  },
  windowValue: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  scheduleContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
  },
  scheduleTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkNavy,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  mealTimeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  mealCalories: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});

export default MealTimingSection;
