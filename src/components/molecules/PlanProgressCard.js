import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';

const ProgressRing = ({ progress, size = 56, strokeWidth = 5, color }) => {
  // Simplified progress indicator using border
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}20`,
        }}
      />
      {/* Progress indicator - simplified with opacity-based segments */}
      <View
        style={{
          position: 'absolute',
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          opacity: clampedProgress / 100,
        }}
      />
      <Text style={[styles.ringText, { color }]}>{Math.round(clampedProgress)}%</Text>
    </View>
  );
};

const PlanProgressCard = ({ 
  plan = null, 
  consumed = { calories: 0, water: 0, steps: 0 },
  onCreatePlan,
  onLogProgress,
}) => {
  // Calculate progress from plan data
  const progressData = useMemo(() => {
    if (!plan) return null;

    const calorieGoal = plan.nutritionPlan?.dailyCalories || 2000;
    const waterGoalL = plan.hydrationPlan?.dailyWaterGoal || 2.5;
    const waterGoal = waterGoalL * 1000; // Convert L to ml
    const stepsGoal = plan.activityPlan?.dailyStepsGoal || 10000;

    const calorieProgress = Math.min((consumed.calories / calorieGoal) * 100, 100);
    const waterProgress = Math.min((consumed.water / waterGoal) * 100, 100);
    const stepsProgress = Math.min((consumed.steps / stepsGoal) * 100, 100);
    const overallProgress = (calorieProgress + waterProgress + stepsProgress) / 3;

    return {
      calories: {
        consumed: consumed.calories,
        goal: calorieGoal,
        progress: calorieProgress,
      },
      water: {
        consumed: consumed.water,
        goal: waterGoal,
        progress: waterProgress,
      },
      steps: {
        consumed: consumed.steps,
        goal: stepsGoal,
        progress: stepsProgress,
      },
      overall: overallProgress,
    };
  }, [plan, consumed]);

  // No plan - show prompt
  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.promptContent}>
          <View style={styles.promptIconContainer}>
            <Ionicons name="trophy" size={32} color={colors.mainOrange} />
          </View>
          <Text style={styles.promptTitle}>Get Your Personalized Plan</Text>
          <Text style={styles.promptDescription}>
            Generate a comprehensive health transformation plan tailored to your goals, nutrition needs, and lifestyle.
          </Text>
          {onCreatePlan && (
            <TouchableOpacity style={styles.promptButton} onPress={onCreatePlan}>
              <Ionicons name="rocket" size={18} color={colors.white} />
              <Text style={styles.promptButtonText}>Create My Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={20} color={colors.mainOrange} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Today's Progress</Text>
            <Text style={styles.subtitle}>Keep up the great work!</Text>
          </View>
        </View>
        <View style={styles.overallProgress}>
          <Text style={styles.overallValue}>{Math.round(progressData.overall)}%</Text>
          <Text style={styles.overallLabel}>Complete</Text>
        </View>
      </View>

      <View style={styles.progressItems}>
        <View style={styles.progressItem}>
          <View style={styles.progressCircle}>
            <ProgressRing 
              progress={progressData.calories.progress} 
              color={colors.mainOrange} 
            />
          </View>
          <Text style={styles.progressLabel}>Calories</Text>
          <Text style={styles.progressValue}>
            {progressData.calories.consumed}/{progressData.calories.goal}
          </Text>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressCircle}>
            <ProgressRing 
              progress={progressData.water.progress} 
              color={colors.havelockBlue} 
            />
          </View>
          <Text style={styles.progressLabel}>Water</Text>
          <Text style={styles.progressValue}>
            {(progressData.water.consumed / 1000).toFixed(1)}L/{(progressData.water.goal / 1000).toFixed(1)}L
          </Text>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressCircle}>
            <ProgressRing 
              progress={progressData.steps.progress} 
              color={colors.lima} 
            />
          </View>
          <Text style={styles.progressLabel}>Steps</Text>
          <Text style={styles.progressValue}>
            {progressData.steps.consumed > 0 ? progressData.steps.consumed.toLocaleString() : '--'}
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      {onLogProgress && (
        <Button 
          title="Log Progress" 
          onPress={onLogProgress} 
          variant="ghost"
          icon="add-circle-outline"
          style={styles.ctaButton}
        />
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
    marginBottom: spacing.lg,
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
    backgroundColor: `${colors.mainOrange}15`,
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
  overallProgress: {
    alignItems: 'flex-end',
  },
  overallValue: {
    ...typography.h2,
    color: colors.mainOrange,
  },
  overallLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  progressItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    marginBottom: spacing.sm,
  },
  ringText: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  progressValue: {
    ...typography.caption,
    color: colors.mineShaft,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaButton: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  // Prompt styles
  promptContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  promptIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.mainOrange}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  promptTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  promptDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mainOrange,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  promptButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default PlanProgressCard;
