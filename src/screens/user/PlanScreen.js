import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { userService } from '../../services/api';
import { Button } from '../../components/atoms';
import { TabScreenLayout } from '../../components/templates';
import { colors, spacing, typography, borderRadius } from '../../theme';

const StatCard = ({ icon, label, value, color = colors.mainOrange, subtitle }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const SectionCard = ({ title, icon, children, color = colors.mineShaft }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// Helper to format time from "HH:MM" to "H AM/PM"
const formatTime = (time) => {
  if (!time) return '';
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
};

// Milestone item component
const MilestoneItem = ({ milestone, index, isLast, currentWeight }) => {
  const isReached = currentWeight && milestone.weight >= currentWeight;
  return (
    <View style={styles.milestoneItem}>
      <View style={styles.milestoneLeft}>
        <View style={[
          styles.milestoneDot,
          isReached && styles.milestoneDotReached
        ]}>
          {isReached && <Ionicons name="checkmark" size={12} color={colors.white} />}
        </View>
        {!isLast && <View style={styles.milestoneLine} />}
      </View>
      <View style={styles.milestoneContent}>
        <Text style={styles.milestoneWeek}>{milestone.week || `Week ${index + 1}`}</Text>
        <Text style={styles.milestoneWeight}>{milestone.weight} kg</Text>
        {milestone.description && (
          <Text style={styles.milestoneDescription}>{milestone.description}</Text>
        )}
      </View>
    </View>
  );
};

// Recommendation item component
const RecommendationItem = ({ recommendation, index }) => (
  <View style={styles.recommendationItem}>
    <View style={styles.recommendationNumber}>
      <Text style={styles.recommendationNumberText}>{index + 1}</Text>
    </View>
    <Text style={styles.recommendationText}>{recommendation}</Text>
  </View>
);

// Progress tracking item
const ProgressTrackingItem = ({ item }) => (
  <View style={styles.progressTrackingItem}>
    <View style={styles.progressTrackingIcon}>
      <Ionicons name={item.icon || 'checkmark-circle-outline'} size={20} color={colors.lima} />
    </View>
    <View style={styles.progressTrackingContent}>
      <Text style={styles.progressTrackingTitle}>{item.metric || item.title}</Text>
      <Text style={styles.progressTrackingFrequency}>{item.frequency}</Text>
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

  const nutritionPlan = plan.nutritionPlan?.daily || {};
  const weightPlan = plan.weightPlan || {};
  const activityPlan = plan.activityPlan || {};
  const hydrationPlan = plan.hydrationPlan || {};
  const sleepPlan = plan.sleepPlan || {};
  const mealTimingPlan = plan.mealTimingPlan || {};
  const recommendations = plan.recommendations || [];
  const progressTracking = plan.progressTracking || {};
  const education = plan.education || {};
  const adaptive = plan.adaptive || {};

  return (
    <TabScreenLayout 
      title="My Health Plan"
      subtitle="Your personalized transformation roadmap"
      refreshing={refreshing} 
      onRefresh={onRefresh}
    >
        {/* Stats Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsRow}
          contentContainerStyle={styles.statsRowContent}
        >
          <StatCard
            icon="flame-outline"
            label="Daily Calories"
            value={nutritionPlan.calories?.toLocaleString() || '--'}
            color={colors.mainOrange}
            subtitle="kcal/day"
          />
          <StatCard
            icon="water-outline"
            label="Hydration"
            value={hydrationPlan.dailyWaterGoal || '--'}
            color={colors.havelockBlue}
            subtitle="L/day"
          />
          <StatCard
            icon="footsteps-outline"
            label="Daily Steps"
            value={activityPlan.dailyStepsGoal?.toLocaleString() || '--'}
            color={colors.lima}
            subtitle="steps/day"
          />
          <StatCard
            icon="scale-outline"
            label="Goal Weight"
            value={weightPlan.goalWeight || '--'}
            color={colors.purple}
            subtitle="kg"
          />
        </ScrollView>

        {/* Weight Plan */}
        {weightPlan.currentWeight && (
          <SectionCard title="Weight Journey" icon="trending-down-outline" color={colors.purple}>
            <View style={styles.weightProgress}>
              <View style={styles.weightItem}>
                <Text style={styles.weightLabel}>Current</Text>
                <Text style={styles.weightValue}>{weightPlan.currentWeight} kg</Text>
              </View>
              <View style={styles.weightArrow}>
                <Ionicons name="arrow-forward" size={20} color={colors.raven} />
              </View>
              <View style={styles.weightItem}>
                <Text style={styles.weightLabel}>Goal</Text>
                <Text style={[styles.weightValue, { color: colors.lima }]}>{weightPlan.goalWeight} kg</Text>
              </View>
            </View>
            {weightPlan.weeklyGoal && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.raven} />
                <Text style={styles.infoText}>
                  Weekly goal: {weightPlan.weeklyGoal > 0 ? '+' : ''}{weightPlan.weeklyGoal} kg
                </Text>
              </View>
            )}
            {(weightPlan.estimatedTimeWeeks || weightPlan.estimatedTimeToGoal) && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={colors.raven} />
                <Text style={styles.infoText}>
                  Estimated time: {weightPlan.estimatedTimeWeeks || weightPlan.estimatedTimeToGoal} weeks
                </Text>
              </View>
            )}

            {/* Rationale */}
            {weightPlan.rationale && (
              <View style={styles.rationaleContainer}>
                <Text style={styles.rationaleText}>{weightPlan.rationale}</Text>
              </View>
            )}

            {/* Milestones */}
            {weightPlan.milestones && weightPlan.milestones.length > 0 && (
              <View style={styles.milestonesContainer}>
                <Text style={styles.milestonesTitle}>Your Journey Milestones</Text>
                {weightPlan.milestones.slice(0, 4).map((milestone, index) => (
                  <MilestoneItem
                    key={index}
                    milestone={milestone}
                    index={index}
                    isLast={index === Math.min(weightPlan.milestones.length, 4) - 1}
                    currentWeight={weightPlan.currentWeight}
                  />
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* Sleep Plan */}
        {sleepPlan.targetHours && (
          <SectionCard title="Sleep Plan" icon="moon-outline" color={colors.purple}>
            <View style={styles.sleepContent}>
              <View style={styles.sleepMainStat}>
                <Ionicons name="bed-outline" size={32} color={colors.purple} />
                <Text style={styles.sleepHours}>{sleepPlan.targetHours}</Text>
                <Text style={styles.sleepUnit}>hours/night</Text>
              </View>
              {sleepPlan.bedtime && sleepPlan.wakeTime && (
                <View style={styles.sleepSchedule}>
                  <View style={styles.sleepTimeItem}>
                    <Ionicons name="moon" size={16} color={colors.raven} />
                    <Text style={styles.sleepTimeLabel}>Bedtime</Text>
                    <Text style={styles.sleepTimeValue}>{formatTime(sleepPlan.bedtime)}</Text>
                  </View>
                  <View style={styles.sleepTimeItem}>
                    <Ionicons name="sunny" size={16} color={colors.mainOrange} />
                    <Text style={styles.sleepTimeLabel}>Wake up</Text>
                    <Text style={styles.sleepTimeValue}>{formatTime(sleepPlan.wakeTime)}</Text>
                  </View>
                </View>
              )}
              {sleepPlan.tips && sleepPlan.tips.length > 0 && (
                <View style={styles.sleepTips}>
                  {sleepPlan.tips.slice(0, 3).map((tip, index) => (
                    <View key={index} style={styles.sleepTipItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.lima} />
                      <Text style={styles.sleepTipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </SectionCard>
        )}

        {/* Meal Timing & Fasting */}
        {mealTimingPlan.fastingRecommendation && (
          <SectionCard title="Meal Timing & Fasting" icon="timer-outline" color={colors.mainOrange}>
            <View style={styles.fastingProtocol}>
              <Text style={styles.fastingProtocolLabel}>Protocol</Text>
              <Text style={styles.fastingProtocolValue}>
                {mealTimingPlan.fastingRecommendation.fastingHours}:
                {mealTimingPlan.fastingRecommendation.eatingHours || 
                  24 - mealTimingPlan.fastingRecommendation.fastingHours}
              </Text>
            </View>

            {mealTimingPlan.eatingWindow && (
              <View style={styles.eatingWindowContainer}>
                <View style={styles.eatingWindowItem}>
                  <Text style={styles.eatingWindowLabel}>Eating Window</Text>
                  <Text style={styles.eatingWindowValue}>
                    {formatTime(mealTimingPlan.eatingWindow.start)} – {formatTime(mealTimingPlan.eatingWindow.end)}
                  </Text>
                </View>
                <View style={styles.eatingWindowItem}>
                  <Text style={styles.eatingWindowLabel}>Fasting Period</Text>
                  <Text style={styles.eatingWindowValue}>
                    {formatTime(mealTimingPlan.eatingWindow.end)} – {formatTime(mealTimingPlan.eatingWindow.start)}
                  </Text>
                </View>
              </View>
            )}

            {mealTimingPlan.suggestedSchedule && mealTimingPlan.suggestedSchedule.length > 0 && (
              <View style={styles.mealScheduleContainer}>
                <Text style={styles.mealScheduleTitle}>Meal Schedule</Text>
                {mealTimingPlan.suggestedSchedule.map((meal, index) => (
                  <View key={index} style={styles.mealScheduleItem}>
                    <View style={styles.mealScheduleTime}>
                      <Ionicons name="time-outline" size={14} color={colors.mainOrange} />
                      <Text style={styles.mealScheduleTimeText}>{meal.timeWindow}</Text>
                    </View>
                    <View style={styles.mealScheduleInfo}>
                      <Text style={styles.mealScheduleName}>{meal.mealType}</Text>
                      <Text style={styles.mealScheduleCalories}>{meal.calorieTarget} kcal</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {/* Hydration Schedule */}
        {hydrationPlan.schedule && hydrationPlan.schedule.length > 0 && (
          <SectionCard title="Hydration Schedule" icon="water-outline" color={colors.havelockBlue}>
            <View style={styles.hydrationGoal}>
              <Text style={styles.hydrationGoalValue}>{hydrationPlan.dailyWaterGoal}L</Text>
              <Text style={styles.hydrationGoalLabel}>daily goal</Text>
            </View>
            <View style={styles.hydrationSchedule}>
              {hydrationPlan.schedule.slice(0, 6).map((item, index) => (
                <View key={index} style={styles.hydrationItem}>
                  <Text style={styles.hydrationTime}>{item.time}</Text>
                  <Text style={styles.hydrationAmount}>{item.amount}</Text>
                </View>
              ))}
            </View>
            {hydrationPlan.rationale && (
              <Text style={styles.hydrationRationale}>{hydrationPlan.rationale}</Text>
            )}
          </SectionCard>
        )}

        {/* Nutrition Plan */}
        <SectionCard title="Nutrition Plan" icon="nutrition-outline" color={colors.mainOrange}>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionPlan.protein || '--'}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionPlan.carbs || '--'}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionPlan.fats || '--'}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>
          {plan.nutritionPlan?.mealTiming && (
            <View style={styles.mealTiming}>
              <Text style={styles.mealTimingTitle}>Meal Schedule</Text>
              {plan.nutritionPlan.mealTiming.map((meal, index) => (
                <View key={index} style={styles.mealItem}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <Text style={styles.mealName}>{meal.meal}</Text>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        {/* Activity Plan */}
        <SectionCard title="Activity Plan" icon="fitness-outline" color={colors.lima}>
          <View style={styles.activityGrid}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>
                {activityPlan.weeklyWorkouts || activityPlan.weeklyWorkoutMinutes || '--'}
              </Text>
              <Text style={styles.activityLabel}>
                {activityPlan.weeklyWorkoutMinutes ? 'Min/week' : 'Workouts/week'}
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{activityPlan.restDays || activityPlan.workoutDuration || '--'}</Text>
              <Text style={styles.activityLabel}>{activityPlan.restDays ? 'Rest days' : 'Min/session'}</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{activityPlan.dailyStepsGoal?.toLocaleString() || '--'}</Text>
              <Text style={styles.activityLabel}>Daily steps</Text>
            </View>
          </View>
          {(activityPlan.recommendedActivities || activityPlan.recommendedExercises) && (
            <View style={styles.activitiesList}>
              <Text style={styles.activitiesTitle}>Recommended Activities</Text>
              <View style={styles.activitiesTags}>
                {(activityPlan.recommendedActivities || activityPlan.recommendedExercises)?.map((activity, index) => (
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

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <SectionCard title="Personalized Recommendations" icon="bulb-outline" color={colors.mainOrange}>
            {recommendations.map((rec, index) => (
              <RecommendationItem key={index} recommendation={rec} index={index} />
            ))}
          </SectionCard>
        )}

        {/* Progress Tracking */}
        {progressTracking.metrics && progressTracking.metrics.length > 0 && (
          <SectionCard title="Progress Tracking Guide" icon="analytics-outline" color={colors.havelockBlue}>
            {progressTracking.metrics.map((item, index) => (
              <ProgressTrackingItem key={index} item={item} />
            ))}
            {progressTracking.checkInFrequency && (
              <View style={styles.checkInFrequency}>
                <Ionicons name="calendar-outline" size={16} color={colors.raven} />
                <Text style={styles.checkInFrequencyText}>
                  Check-in: {progressTracking.checkInFrequency}
                </Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* Education */}
        {education.topics && education.topics.length > 0 && (
          <SectionCard title="Understanding Your Plan" icon="school-outline" color={colors.purple}>
            {education.topics.map((topic, index) => (
              <View key={index} style={styles.educationTopic}>
                <Text style={styles.educationTopicTitle}>{topic.title}</Text>
                <Text style={styles.educationTopicContent}>{topic.content}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Adaptive Plan */}
        {adaptive.reviewSchedule && (
          <SectionCard title="Plan Review & Adjustments" icon="refresh-outline" color={colors.lima}>
            <View style={styles.adaptiveContent}>
              <View style={styles.adaptiveItem}>
                <Ionicons name="calendar" size={20} color={colors.lima} />
                <View style={styles.adaptiveItemContent}>
                  <Text style={styles.adaptiveItemTitle}>Review Schedule</Text>
                  <Text style={styles.adaptiveItemValue}>{adaptive.reviewSchedule}</Text>
                </View>
              </View>
              {adaptive.adjustmentTriggers && adaptive.adjustmentTriggers.length > 0 && (
                <View style={styles.adaptiveTriggers}>
                  <Text style={styles.adaptiveTriggersTitle}>Adjustment Triggers</Text>
                  {adaptive.adjustmentTriggers.map((trigger, index) => (
                    <View key={index} style={styles.adaptiveTriggerItem}>
                      <Ionicons name="alert-circle-outline" size={16} color={colors.raven} />
                      <Text style={styles.adaptiveTriggerText}>{trigger}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </SectionCard>
        )}

        {/* Regenerate Button */}
        <View style={styles.regenerateSection}>
          <Button
            title={generating ? 'Regenerating...' : 'Regenerate Plan'}
            onPress={handleGeneratePlan}
            variant="ghost"
            icon="refresh"
            disabled={generating}
          />
        </View>
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats
  statsRow: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRowContent: {
    paddingHorizontal: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 4,
  },
  statSubtitle: {
    ...typography.caption,
    color: colors.alto,
    fontSize: 10,
  },
  // Sections
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  // Weight
  weightProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  weightItem: {
    alignItems: 'center',
    flex: 1,
  },
  weightLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  weightValue: {
    ...typography.h3,
    color: colors.mineShaft,
    marginTop: 4,
  },
  weightArrow: {
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
  // Macros
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...typography.h3,
    color: colors.mainOrange,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 4,
  },
  mealTiming: {
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  mealTimingTitle: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  mealTime: {
    ...typography.caption,
    color: colors.mainOrange,
    width: 80,
    fontWeight: '600',
  },
  mealName: {
    ...typography.bodySmall,
    color: colors.mineShaft,
  },
  // Activity
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    ...typography.h3,
    color: colors.lima,
  },
  activityLabel: {
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
  // Rationale
  rationaleContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Milestones
  milestonesContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  milestonesTitle: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  milestoneItem: {
    flexDirection: 'row',
  },
  milestoneLeft: {
    alignItems: 'center',
    width: 24,
  },
  milestoneDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDotReached: {
    backgroundColor: colors.lima,
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gallery,
    marginVertical: 4,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.md,
  },
  milestoneWeek: {
    ...typography.caption,
    color: colors.raven,
  },
  milestoneWeight: {
    ...typography.bodyLarge,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  milestoneDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: 2,
  },
  // Sleep
  sleepContent: {
    alignItems: 'center',
  },
  sleepMainStat: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sleepHours: {
    ...typography.h1,
    color: colors.purple,
    marginTop: spacing.xs,
  },
  sleepUnit: {
    ...typography.caption,
    color: colors.raven,
  },
  sleepSchedule: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  sleepTimeItem: {
    alignItems: 'center',
  },
  sleepTimeLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
  },
  sleepTimeValue: {
    ...typography.bodyLarge,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  sleepTips: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
  },
  sleepTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sleepTipText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Fasting
  fastingProtocol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.mainOrange}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  fastingProtocolLabel: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  fastingProtocolValue: {
    ...typography.h3,
    color: colors.mainOrange,
  },
  eatingWindowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  eatingWindowItem: {
    alignItems: 'center',
  },
  eatingWindowLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: 4,
  },
  eatingWindowValue: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  mealScheduleContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
  },
  mealScheduleTitle: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  mealScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  mealScheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  mealScheduleTimeText: {
    ...typography.caption,
    color: colors.mainOrange,
    marginLeft: 4,
  },
  mealScheduleInfo: {
    flex: 1,
  },
  mealScheduleName: {
    ...typography.body,
    color: colors.mineShaft,
  },
  mealScheduleCalories: {
    ...typography.caption,
    color: colors.raven,
  },
  // Hydration
  hydrationGoal: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hydrationGoalValue: {
    ...typography.h1,
    color: colors.havelockBlue,
  },
  hydrationGoalLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  hydrationSchedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hydrationItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: `${colors.havelockBlue}10`,
    borderRadius: borderRadius.md,
  },
  hydrationTime: {
    ...typography.caption,
    color: colors.raven,
  },
  hydrationAmount: {
    ...typography.body,
    color: colors.havelockBlue,
    fontWeight: '600',
  },
  hydrationRationale: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  // Recommendations
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.mainOrange}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  recommendationNumberText: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '600',
  },
  recommendationText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
  // Progress Tracking
  progressTrackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  progressTrackingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.lima}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  progressTrackingContent: {
    flex: 1,
  },
  progressTrackingTitle: {
    ...typography.body,
    color: colors.mineShaft,
  },
  progressTrackingFrequency: {
    ...typography.caption,
    color: colors.raven,
  },
  checkInFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkInFrequencyText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
  // Education
  educationTopic: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  educationTopicTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  educationTopicContent: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
  },
  // Adaptive
  adaptiveContent: {},
  adaptiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  adaptiveItemContent: {
    marginLeft: spacing.sm,
  },
  adaptiveItemTitle: {
    ...typography.caption,
    color: colors.raven,
  },
  adaptiveItemValue: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  adaptiveTriggers: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  adaptiveTriggersTitle: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  adaptiveTriggerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  adaptiveTriggerText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.sm,
    flex: 1,
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
