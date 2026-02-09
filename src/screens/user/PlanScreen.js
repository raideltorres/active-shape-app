import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { userService } from '../../services/api';
import { Button, LottiePlayer } from '../../components/atoms';
import { TabScreenLayout } from '../../components/templates';
import {
  WeightManagementSection,
  SleepPlanSection,
  MealTimingSection,
  HydrationSection,
  NutritionPlanSection,
  ActivityPlanSection,
  RecommendationsSection,
  ProgressTrackingSection,
  EducationSection,
  AdaptivePlanSection,
} from '../../components/molecules';
import { fire, water, scale, footSteps } from '../../assets/animations';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { isAdmin } from '../../utils/constants';

// Stat card with colored top border and Lottie animation
const StatCard = ({ animation, label, value, unit, color = colors.mainOrange }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <View style={styles.statCardAnimation}>
      <LottiePlayer source={animation} size={48} />
    </View>
    <Text style={styles.statCardLabel}>{label}</Text>
    <View style={styles.statCardValueRow}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {unit && <Text style={[styles.statCardUnit, { color }]}>{unit}</Text>}
    </View>
  </View>
);

const PlanScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const profileData = await userService.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      await userService.generatePersonalizedPlan();
      await fetchData();
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const plan = profile?.personalizedPlan;

  if (loading) {
    return (
      <TabScreenLayout scrollable={false} title="My Health Plan">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
        </View>
      </TabScreenLayout>
    );
  }

  // No plan yet - show prompt
  if (!plan) {
    return (
      <TabScreenLayout scrollable={false}>
        <View style={styles.noPlanContainer}>
          <View style={styles.noPlanIconContainer}>
            <Ionicons name="trophy-outline" size={64} color={colors.mainOrange} />
          </View>
          <Text style={styles.noPlanTitle}>Your Health Transformation Plan</Text>
          <Text style={styles.noPlanDescription}>
            Get a personalized nutrition, activity, and wellness plan based on your goals, 
            preferences, and health information.
          </Text>
          <Button
            title={generating ? 'Generating...' : 'Generate My Plan'}
            onPress={handleGeneratePlan}
            icon="rocket"
            disabled={generating}
          />
        </View>
      </TabScreenLayout>
    );
  }

  const nutritionPlan = plan.nutritionPlan || {};
  const weightPlan = plan.weightPlan || {};
  const activityPlan = plan.activityPlan || {};
  const hydrationPlan = plan.hydrationPlan || {};
  const sleepPlan = plan.sleepPlan || {};
  const mealTimingPlan = plan.mealTimingPlan || {};

  return (
    <TabScreenLayout 
      title="My Health Plan"
      subtitle="Your personalized transformation roadmap"
      refreshing={refreshing} 
      onRefresh={onRefresh}
    >
      {/* Quick Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          animation={fire}
          label="Daily Calories"
          value={nutritionPlan.daily?.calories?.toLocaleString() || '--'}
          unit="kcal"
          color={colors.mainOrange}
        />
        <StatCard
          animation={scale}
          label="Goal Weight"
          value={weightPlan.goalWeight || '--'}
          unit="kg"
          color={colors.lima}
        />
        <StatCard
          animation={water}
          label="Daily Water"
          value={hydrationPlan.dailyWaterGoal || '--'}
          unit="L"
          color={colors.havelockBlue}
        />
        <StatCard
          animation={footSteps}
          label="Daily Steps"
          value={activityPlan.dailyStepsGoal?.toLocaleString() || '--'}
          color={colors.purple}
        />
      </View>

      {/* Plan Sections */}
      <WeightManagementSection weightPlan={weightPlan} />
      <NutritionPlanSection 
        nutritionPlan={nutritionPlan} 
        mealTiming={nutritionPlan.mealTiming} 
      />
      <SleepPlanSection sleepPlan={sleepPlan} />
      <MealTimingSection mealTimingPlan={mealTimingPlan} />
      <HydrationSection hydrationPlan={hydrationPlan} />
      <ActivityPlanSection activityPlan={activityPlan} />
      <RecommendationsSection recommendations={plan.recommendations} />
      <ProgressTrackingSection progressTracking={plan.progressTracking} />
      <EducationSection education={plan.education} />
      <AdaptivePlanSection adaptive={plan.adaptive} />

      {/* Regenerate Button (Admin only) */}
      {isAdmin(profile?.role) && (
        <View style={styles.regenerateSection}>
          <Button
            title={generating ? 'Regenerating...' : 'Regenerate Plan'}
            onPress={handleGeneratePlan}
            variant="ghost"
            icon="refresh"
            disabled={generating}
          />
        </View>
      )}
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats Cards Container
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderTopWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
    width: '48%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardAnimation: {
    marginBottom: spacing.sm,
  },
  statCardLabel: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.xs,
  },
  statCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statCardValue: {
    ...typography.h2,
    fontWeight: '700',
  },
  statCardUnit: {
    ...typography.body,
    marginLeft: 4,
  },
  // Regenerate
  regenerateSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  // No plan
  noPlanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  noPlanIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.mainOrange}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  noPlanTitle: {
    ...typography.h2,
    color: colors.mineShaft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  noPlanDescription: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
});

export default PlanScreen;
