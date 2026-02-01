import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/api';
import { NutritionSummaryCard, WaterTrackerCard } from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';

/**
 * Get today's date string
 */
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get time-based greeting
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

/**
 * Get motivational message based on user progress
 */
const getMotivationalMessage = (tracking, goals) => {
  const messages = [
    {
      title: "Let's make today count!",
      subtitle: "Small steps lead to big transformations.",
      icon: 'rocket-outline',
    },
    {
      title: "You're doing amazing!",
      subtitle: "Consistency is the key to success.",
      icon: 'trophy-outline',
    },
    {
      title: "Keep pushing forward!",
      subtitle: "Every healthy choice matters.",
      icon: 'trending-up-outline',
    },
    {
      title: "Your journey continues!",
      subtitle: "Progress, not perfection.",
      icon: 'footsteps-outline',
    },
  ];

  // Check progress for personalized messages
  const caloriesConsumed = tracking?.caloriesConsumed || 0;
  const caloriesGoal = goals?.calories || 2000;
  const progress = caloriesConsumed / caloriesGoal;

  if (progress >= 0.8 && progress <= 1.1) {
    return {
      title: "You're on target!",
      subtitle: "Great job staying within your goals today.",
      icon: 'checkmark-circle-outline',
    };
  }

  if (progress > 1.2) {
    return {
      title: "Time to balance out",
      subtitle: "Consider a lighter meal or some extra activity.",
      icon: 'fitness-outline',
    };
  }

  // Random message if no specific condition
  return messages[new Date().getDate() % messages.length];
};

const DashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [todayTracking, setTodayTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [profileData, trackingData] = await Promise.all([
        userService.getProfile(),
        userService.getTrackings(),
      ]);

      setProfile(profileData);

      // Find today's tracking data
      const today = getTodayDate();
      const todayData = trackingData?.find?.((t) => t.date === today) || {};
      setTodayTracking(todayData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const handleAddWater = async (amount) => {
    try {
      const currentWater = todayTracking?.water || 0;
      await userService.createTracking({
        userId: profile?._id,
        date: getTodayDate(),
        field: 'water',
        value: currentWater + amount,
      });
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const nutritionGoals = profile?.nutritionGoals || profile?.personalizedPlan?.nutritionPlan || {};
  const motivationalMessage = getMotivationalMessage(todayTracking, nutritionGoals);

  const nutritionData = {
    calories: todayTracking?.caloriesConsumed || 0,
    proteins: todayTracking?.proteins || 0,
    carbs: todayTracking?.carbs || 0,
    fats: todayTracking?.fats || 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mainOrange} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.mineShaft} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Motivational Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconContainer}>
            <Ionicons name={motivationalMessage.icon} size={28} color={colors.white} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{motivationalMessage.title}</Text>
            <Text style={styles.bannerSubtitle}>{motivationalMessage.subtitle}</Text>
          </View>
        </View>

        {/* Nutrition Summary */}
        <View style={styles.section}>
          <NutritionSummaryCard nutrition={nutritionData} goals={nutritionGoals} />
        </View>

        {/* Water Tracker */}
        <View style={styles.section}>
          <WaterTrackerCard
            consumed={todayTracking?.water || 0}
            goal={profile?.personalizedPlan?.hydrationPlan?.dailyWaterGoal * 1000 || 2500}
            onAddWater={handleAddWater}
          />
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: `${colors.mainOrange}15` }]}>
                <Ionicons name="flame-outline" size={20} color={colors.mainOrange} />
              </View>
              <Text style={styles.summaryValue}>{nutritionData.calories}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: `${colors.havelockBlue}15` }]}>
                <Ionicons name="water-outline" size={20} color={colors.havelockBlue} />
              </View>
              <Text style={styles.summaryValue}>{((todayTracking?.water || 0) / 1000).toFixed(1)}L</Text>
              <Text style={styles.summaryLabel}>Water</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: `${colors.lima}15` }]}>
                <Ionicons name="barbell-outline" size={20} color={colors.lima} />
              </View>
              <Text style={styles.summaryValue}>{todayTracking?.workouts || 0}</Text>
              <Text style={styles.summaryLabel}>Workouts</Text>
            </View>
          </View>
        </View>

        {/* Weight Progress Card */}
        {profile?.weight && (
          <View style={styles.section}>
            <View style={styles.weightCard}>
              <View style={styles.weightHeader}>
                <View style={styles.weightIconContainer}>
                  <Ionicons name="scale-outline" size={20} color={colors.purple} />
                </View>
                <Text style={styles.weightTitle}>Current Weight</Text>
              </View>
              <View style={styles.weightContent}>
                <Text style={styles.weightValue}>{profile.weight}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              {profile?.goalWeight && (
                <Text style={styles.weightGoal}>Goal: {profile.goalWeight} kg</Text>
              )}
            </View>
          </View>
        )}

        {/* Bottom Padding for Tab Bar */}
        <View style={{ height: spacing.tabBarPadding }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.raven,
  },
  userName: {
    ...typography.h1,
    color: colors.mineShaft,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mainOrange,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mainBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  bannerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.85,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  weightCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.purple}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  weightTitle: {
    ...typography.h4,
  },
  weightContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    ...typography.h1,
    color: colors.purple,
  },
  weightUnit: {
    ...typography.h4,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
  weightGoal: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
  },
});

export default DashboardScreen;
