import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Helper to format time from "HH:MM" to "H AM/PM"
const formatTime = (time) => {
  if (!time) return '';
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
};

/**
 * Meal Timing & Fasting section for Plan screen
 */
const MealTimingSection = ({ mealTimingPlan }) => {
  if (!mealTimingPlan?.fastingRecommendation) return null;

  return (
    <SectionCard title="Meal Timing & Fasting" icon="timer-outline" color={colors.mainOrange}>
      <View style={styles.protocol}>
        <Text style={styles.protocolLabel}>Protocol</Text>
        <Text style={styles.protocolValue}>
          {mealTimingPlan.fastingRecommendation.fastingHours}:
          {mealTimingPlan.fastingRecommendation.eatingHours || 
            24 - mealTimingPlan.fastingRecommendation.fastingHours}
        </Text>
      </View>

      {mealTimingPlan.eatingWindow && (
        <View style={styles.windowContainer}>
          <View style={styles.windowItem}>
            <Text style={styles.windowLabel}>Eating Window</Text>
            <Text style={styles.windowValue}>
              {formatTime(mealTimingPlan.eatingWindow.start)} – {formatTime(mealTimingPlan.eatingWindow.end)}
            </Text>
          </View>
          <View style={styles.windowItem}>
            <Text style={styles.windowLabel}>Fasting Period</Text>
            <Text style={styles.windowValue}>
              {formatTime(mealTimingPlan.eatingWindow.end)} – {formatTime(mealTimingPlan.eatingWindow.start)}
            </Text>
          </View>
        </View>
      )}

      {mealTimingPlan.suggestedSchedule && mealTimingPlan.suggestedSchedule.length > 0 && (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Meal Schedule</Text>
          {mealTimingPlan.suggestedSchedule.map((meal, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Ionicons name="time-outline" size={14} color={colors.mainOrange} />
                <Text style={styles.scheduleTimeText}>{meal.timeWindow}</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>{meal.mealType}</Text>
                <Text style={styles.scheduleCalories}>{meal.calorieTarget} kcal</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  protocol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.mainOrange}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  protocolLabel: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  protocolValue: {
    ...typography.h3,
    color: colors.mainOrange,
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
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  scheduleTimeText: {
    ...typography.caption,
    color: colors.mainOrange,
    marginLeft: 4,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    ...typography.body,
    color: colors.mineShaft,
  },
  scheduleCalories: {
    ...typography.caption,
    color: colors.raven,
  },
});

export default MealTimingSection;
