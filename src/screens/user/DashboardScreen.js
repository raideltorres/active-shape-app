import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/api';
import { 
  NutritionSummaryCard, 
  WeeklySummaryCard,
  DailyInsightsCard,
  WeightProgressCard,
  BmiCard,
  PlanProgressCard,
  FastingTrackerCard,
} from '../../components/molecules';
import { TabScreenLayout } from '../../components/templates';
import { spacing } from '../../theme';

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
  const [fastingPlan, setFastingPlan] = useState(null);
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

      // Fetch fasting plan if user has one selected
      if (profileData?.fastingSettings?.fastingPlanId) {
        try {
          const planData = await userService.getFastingPlan(profileData.fastingSettings.fastingPlanId);
          setFastingPlan(planData);
        } catch (err) {
          console.error('Error fetching fasting plan:', err);
        }
      } else {
        setFastingPlan(null);
      }
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

  const handleLogProgress = () => {
    // Navigate to tracking screen
    navigation?.navigate?.('TrackingTab');
  };

  const handleLogMeals = () => {
    // Navigate to tracking screen (meals section)
    navigation?.navigate?.('TrackingTab');
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


  return (
    <TabScreenLayout 
      greeting={`${getGreeting()},`}
      title={userName}
      subtitle="Track your progress and stay on top of your health goals"
      refreshing={refreshing} 
      onRefresh={onRefresh}
    >
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
          bmiData={profile?.bmi}
          bodyComposition={{
            type: profile?.bodyComposition,
            bodyFat: profile?.bodyFat,
            muscleMass: profile?.muscleMass,
          }}
        />
      </View>

      {/* Plan Progress */}
      <View style={styles.section}>
        <PlanProgressCard
          plan={personalizedPlan}
          consumed={consumedData}
          onCreatePlan={handleCreatePlan}
          onLogProgress={handleLogProgress}
        />
      </View>

      {/* Nutrition Summary */}
      <View style={styles.section}>
        <NutritionSummaryCard 
          nutrition={nutritionData} 
          goals={nutritionGoals} 
          onLogMeals={handleLogMeals}
        />
      </View>

      {/* Fasting Tracker */}
      <View style={styles.section}>
        <FastingTrackerCard
          fastingPlan={fastingPlan}
          fastingStarted={profile?.fastingSettings?.lastFastingStarted}
          onStart={handleStartFasting}
          onStop={handleStopFasting}
          onSetupFasting={handleSetupFasting}
        />
      </View>
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
});

export default DashboardScreen;
