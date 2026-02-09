import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { LottiePlayer } from '../../atoms';
import { heart, exercise } from '../../../assets/animations';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Format steps (10000 -> 10k)
const formatSteps = (steps) => {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return steps;
};

// Stat card with icon
const StatCard = ({ icon, iconBgColor, value, label }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
      <Ionicons name={icon} size={20} color={colors.white} />
    </View>
    <View style={styles.statTextContainer}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

// Get animation for workout type
const getWorkoutAnimation = (type) => {
  const typeLower = type?.toLowerCase() || '';
  if (typeLower.includes('cardio')) return { source: heart, size: 58 };
  if (typeLower.includes('strength')) return { source: exercise, size: 40 };
  return { source: heart, size: 52 }; // default
};

// Get intensity color
const getIntensityColor = (intensity) => {
  switch (intensity?.toLowerCase()) {
    case 'high': return colors.mainOrange;
    case 'moderate': 
    case 'medium': return colors.havelockBlue;
    case 'low': return colors.lima;
    default: return colors.raven;
  }
};

// Workout type card
const WorkoutCard = ({ exerciseData }) => {
  const { source: animationSource, size: animationSize } = getWorkoutAnimation(exerciseData.type);
  const examples = exerciseData.examples || [];

  return (
    <View style={styles.workoutCard}>
      <View style={styles.workoutAnimationContainer}>
        <LottiePlayer source={animationSource} size={animationSize} />
      </View>
      
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTitle}>{exerciseData.type}</Text>
        {exerciseData.intensity && (
          <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(exerciseData.intensity) }]}>
            <Text style={styles.intensityText}>{exerciseData.intensity.toUpperCase()}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.workoutDetails}>
        {exerciseData.frequency ? `${exerciseData.frequency}x per week` : ''}
        {exerciseData.duration ? ` • ${exerciseData.duration} min` : ''}
      </Text>
      
      {examples.length > 0 && (
        <View style={styles.activityTags}>
          {examples.slice(0, 4).map((example, index) => (
            <View key={index} style={styles.activityTag}>
              <Text style={styles.activityTagText}>{example}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Activity Plan section for Plan screen
 */
const ActivityPlanSection = ({ activityPlan }) => {
  if (!activityPlan) return null;

  const exercises = activityPlan.recommendedExercises || [];
  const dailySteps = activityPlan.dailyStepsGoal || 10000;
  const restDays = activityPlan.restDays || 1;
  const activeDays = 7 - restDays;
  
  // Calculate daily workout from exercises or use weekly minutes
  const weeklyMinutes = activityPlan.weeklyWorkoutMinutes || 0;
  const dailyWorkoutMin = weeklyMinutes > 0 
    ? Math.round(weeklyMinutes / activeDays) 
    : (exercises.length > 0 ? exercises[0].duration : 60);

  return (
    <SectionCard title="Activity Plan" icon="fitness-outline" color={colors.mainOrange}>
      {/* Stat Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="stopwatch-outline"
          iconBgColor={colors.mainOrange}
          value={`${dailyWorkoutMin} min`}
          label="DAILY WORKOUT"
        />
        <StatCard
          icon="footsteps-outline"
          iconBgColor={colors.havelockBlue}
          value={`${formatSteps(dailySteps)} steps`}
          label="DAILY GOAL"
        />
        <StatCard
          icon="bed-outline"
          iconBgColor={colors.mainOrange}
          value={`${restDays} days`}
          label="REST PER WEEK"
        />
      </View>

      {/* Rationale from backend */}
      {activityPlan.rationale && (
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleText}>{activityPlan.rationale}</Text>
        </View>
      )}

      {/* Workout Cards */}
      {exercises.length > 0 && (
        <View style={styles.workoutsContainer}>
          {exercises.map((item, index) => (
            <WorkoutCard key={index} exerciseData={item} />
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginBottom: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.mineShaft,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mainOrange,
    letterSpacing: 0.5,
  },
  rationaleContainer: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.mainOrange,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  workoutsContainer: {
    marginTop: spacing.sm,
  },
  workoutCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gallery,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  workoutAnimationContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  workoutTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  intensityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  intensityText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  workoutDetails: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.sm,
  },
  activityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  activityTag: {
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  activityTagText: {
    ...typography.caption,
    color: colors.mineShaft,
  },
});

export default ActivityPlanSection;
