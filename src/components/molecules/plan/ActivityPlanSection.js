import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

/**
 * Activity Plan section for Plan screen
 */
const ActivityPlanSection = ({ activityPlan }) => {
  if (!activityPlan) return null;

  const exercises = activityPlan.recommendedActivities || activityPlan.recommendedExercises || [];

  return (
    <SectionCard title="Activity Plan" icon="fitness-outline" color={colors.lima}>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.value}>
            {activityPlan.weeklyWorkouts || activityPlan.weeklyWorkoutMinutes || '--'}
          </Text>
          <Text style={styles.label}>
            {activityPlan.weeklyWorkoutMinutes ? 'Min/week' : 'Workouts/week'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.value}>
            {activityPlan.restDays || activityPlan.workoutDuration || '--'}
          </Text>
          <Text style={styles.label}>
            {activityPlan.restDays ? 'Rest days' : 'Min/session'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.value}>
            {activityPlan.dailyStepsGoal?.toLocaleString() || '--'}
          </Text>
          <Text style={styles.label}>Daily steps</Text>
        </View>
      </View>

      {exercises.length > 0 && (
        <View style={styles.activitiesList}>
          <Text style={styles.activitiesTitle}>Recommended Activities</Text>
          <View style={styles.activitiesTags}>
            {exercises.map((activity, index) => (
              <View key={index} style={styles.activityTag}>
                <Text style={styles.activityTagText}>
                  {typeof activity === 'string' ? activity : activity.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  item: {
    alignItems: 'center',
  },
  value: {
    ...typography.h3,
    color: colors.lima,
  },
  label: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 4,
  },
  activitiesList: {
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  activitiesTitle: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  activitiesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityTag: {
    backgroundColor: `${colors.lima}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  activityTagText: {
    ...typography.caption,
    color: colors.lima,
    fontWeight: '500',
  },
});

export default ActivityPlanSection;
