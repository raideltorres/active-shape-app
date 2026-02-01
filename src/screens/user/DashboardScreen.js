import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/api';
import { 
  NutritionSummaryCard, 
  WaterTrackerCard,
  WeeklySummaryCard,
  DailyInsightsCard,
  WeightProgressCard,
  BmiCard,
  PlanProgressCard,
  FastingTrackerCard,
} from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [todayTracking, setTodayTracking] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profileData, trackingsData] = await Promise.all([
        userService.getProfile(),
        userService.getTrackings(),
      ]);

      setProfile(profileData);
      setTrackingData(trackingsData || []);

      // Find today's tracking data
      const today = getTodayDate();
      const todayData = trackingsData?.find?.((t) => t.date === today) || {};
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
      fetchData();
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const handleGenerateInsights = async () => {
    if (!trackingData || trackingData.length === 0) return;
    
    setIsGeneratingInsights(true);
    try {
      await userService.generateDailyInsights();
      await fetchData(); // Refresh to get new insights
    } catch (error) {
      console.error('Failed to generate daily insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleCreatePlan = () => {
    // Navigate to plan creation screen
    navigation?.navigate?.('ProfileTab', { screen: 'Goals' });
  };

  const handleSetupFasting = () => {
    // Navigate to fasting settings
    navigation?.navigate?.('ProfileTab', { screen: 'Settings' });
  };

  const handleStartFasting = async () => {
    try {
      await userService.upsertUser({
        id: profile?._id,
        fastingSettings: { 
          ...profile?.fastingSettings, 
          lastFastingStarted: new Date().toISOString(), 
          lastFastingEnded: null 
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error starting fast:', error);
    }
  };

  const handleStopFasting = async (elapsedSeconds, stagesReached) => {
    try {
      await userService.upsertUser({
        id: profile?._id,
        fastingSettings: { 
          ...profile?.fastingSettings, 
          lastFastingStarted: null, 
          lastFastingEnded: new Date().toISOString() 
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error stopping fast:', error);
    }
  };

  const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const nutritionGoals = profile?.nutritionGoals || profile?.personalizedPlan?.nutritionPlan || {};
  const personalizedPlan = profile?.personalizedPlan;

  // Today's nutrition data
  const nutritionData = {
    calories: todayTracking?.caloriesConsumed || 0,
    proteins: todayTracking?.proteins || 0,
    carbs: todayTracking?.carbs || 0,
    fats: todayTracking?.fats || 0,
  };

  // Consumed data for plan progress
  const consumedData = {
    calories: todayTracking?.caloriesConsumed || 0,
    water: todayTracking?.water || todayTracking?.waterConsumed || 0,
    steps: todayTracking?.steps || 0,
  };

  // Weight data for chart - filter records with weight
  const weightRecords = trackingData
    ?.filter((record) => record.weight != null)
    ?.map((record) => ({ date: record.date, weight: record.weight })) || [];

  // Initial and current weight
  const initialWeight = profile?.weight || profile?.personalizedPlan?.weightPlan?.currentWeight;
  const currentWeight = weightRecords.length > 0 
    ? weightRecords[weightRecords.length - 1]?.weight 
    : initialWeight;
  const goalWeight = profile?.goalWeight || profile?.personalizedPlan?.weightPlan?.goalWeight;

  // Fasting plan data
  const fastingPlanData = profile?.fastingSettings?.fastingPlanId 
    ? { fastingTime: 16, title: '16:8 Protocol' } // TODO: Fetch actual plan data
    : null;

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

        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>
          Track your progress and stay on top of your health goals
        </Text>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <WeeklySummaryCard trackingData={trackingData} />
        </View>

        {/* Daily Insights (AI) */}
        <View style={styles.section}>
          <DailyInsightsCard
            insights={profile?.dailyInsights}
            hasTrackingData={trackingData?.length > 0}
            isLoading={isGeneratingInsights}
            onGenerateInsights={handleGenerateInsights}
          />
        </View>

        {/* Weight Progress */}
        <View style={styles.section}>
          <WeightProgressCard
            weightData={weightRecords}
            initialWeight={initialWeight}
            currentWeight={currentWeight}
            goalWeight={goalWeight}
            profileCreatedAt={profile?.createdAt}
          />
        </View>

        {/* BMI */}
        <View style={styles.section}>
          <BmiCard
            weight={currentWeight || profile?.weight}
            height={profile?.height}
            bodyComposition={profile?.bodyComposition}
          />
        </View>

        {/* Plan Progress */}
        <View style={styles.section}>
          <PlanProgressCard
            plan={personalizedPlan}
            consumed={consumedData}
            onCreatePlan={handleCreatePlan}
          />
        </View>

        {/* Nutrition Summary */}
        <View style={styles.section}>
          <NutritionSummaryCard nutrition={nutritionData} goals={nutritionGoals} />
        </View>

        {/* Water Tracker */}
        <View style={styles.section}>
          <WaterTrackerCard
            consumed={todayTracking?.water || todayTracking?.waterConsumed || 0}
            goal={(profile?.personalizedPlan?.hydrationPlan?.dailyWaterGoal || 2.5) * 1000}
            onAddWater={handleAddWater}
          />
        </View>

        {/* Fasting Tracker */}
        <View style={styles.section}>
          <FastingTrackerCard
            fastingPlan={fastingPlanData}
            fastingStarted={profile?.fastingSettings?.lastFastingStarted}
            onStart={handleStartFasting}
            onStop={handleStopFasting}
            onSetupFasting={handleSetupFasting}
          />
        </View>

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
    marginBottom: spacing.xs,
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
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.xl,
    lineHeight: 20,
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
  section: {
    marginBottom: spacing.lg,
  },
});

export default DashboardScreen;
