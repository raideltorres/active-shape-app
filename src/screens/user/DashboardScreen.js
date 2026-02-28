import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import {
  useGetProfileQuery,
  useGetTrackingsQuery,
  useUpsertUserMutation,
  useGenerateDailyInsightsMutation,
} from '../../store/api';
import { useGetFastingPlanQuery } from '../../store/api/fastingApi';
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

  const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
  const { data: trackingData = [], refetch: refetchTrackings } = useGetTrackingsQuery(
    profile?._id,
    { skip: !profile?._id },
  );
  const { data: fastingPlan } = useGetFastingPlanQuery(
    profile?.fastingSettings?.fastingPlanId,
    { skip: !profile?.fastingSettings?.fastingPlanId },
  );

  const [upsertUser] = useUpsertUserMutation();
  const [generateInsights, { isLoading: isGeneratingInsights }] = useGenerateDailyInsightsMutation();

  const todayTracking = useMemo(() => {
    const today = getTodayDate();
    return trackingData?.find?.((t) => t.date === today) || {};
  }, [trackingData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchTrackings()]);
    setRefreshing(false);
  }, [refetchProfile, refetchTrackings]);

  const handleGenerateInsights = async () => {
    if (!trackingData || trackingData.length === 0) return;
    try {
      await generateInsights().unwrap();
      refetchProfile();
    } catch (error) {
      console.error('Failed to generate daily insights:', error);
    }
  };

  const handleCreatePlan = () => {
    navigation?.navigate?.('ProfileTab', { screen: 'Goals' });
  };

  const handleSetupFasting = () => {
    navigation?.navigate?.('ProfileTab', { screen: 'Settings' });
  };

  const handleLogProgress = () => {
    navigation?.navigate?.('TrackingTab');
  };

  const handleLogMeals = () => {
    navigation?.navigate?.('TrackingTab');
  };

  const handleStartFasting = async () => {
    try {
      await upsertUser({
        id: profile?._id,
        fastingSettings: { 
          ...profile?.fastingSettings, 
          lastFastingStarted: new Date().toISOString(), 
          lastFastingEnded: null 
        },
      }).unwrap();
    } catch (error) {
      console.error('Error starting fast:', error);
    }
  };

  const handleStopFasting = async () => {
    try {
      await upsertUser({
        id: profile?._id,
        fastingSettings: { 
          ...profile?.fastingSettings, 
          lastFastingStarted: null, 
          lastFastingEnded: new Date().toISOString() 
        },
      }).unwrap();
    } catch (error) {
      console.error('Error stopping fast:', error);
    }
  };

  const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const nutritionGoals = profile?.nutritionGoals || profile?.personalizedPlan?.nutritionPlan || {};
  const personalizedPlan = profile?.personalizedPlan;

  const nutritionData = {
    calories: todayTracking?.caloriesConsumed || 0,
    proteins: todayTracking?.proteins || 0,
    carbs: todayTracking?.carbs || 0,
    fats: todayTracking?.fats || 0,
  };

  const consumedData = {
    calories: todayTracking?.caloriesConsumed || 0,
    water: todayTracking?.water || todayTracking?.waterConsumed || 0,
    steps: todayTracking?.steps || 0,
  };

  const weightRecords = trackingData
    ?.filter((record) => record.weight != null)
    ?.map((record) => ({ date: record.date, weight: record.weight })) || [];

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
      <View style={styles.section}>
        <WeeklySummaryCard trackingData={trackingData} />
      </View>

      <View style={styles.section}>
        <DailyInsightsCard
          insights={profile?.dailyInsights}
          hasTrackingData={trackingData?.length > 0}
          isLoading={isGeneratingInsights}
          onGenerateInsights={handleGenerateInsights}
        />
      </View>

      <View style={styles.section}>
        <WeightProgressCard
          weightData={weightRecords}
          initialWeight={initialWeight}
          currentWeight={currentWeight}
          goalWeight={goalWeight}
          profileCreatedAt={profile?.createdAt}
        />
      </View>

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

      <View style={styles.section}>
        <PlanProgressCard
          plan={personalizedPlan}
          consumed={consumedData}
          onCreatePlan={handleCreatePlan}
          onLogProgress={handleLogProgress}
        />
      </View>

      <View style={styles.section}>
        <NutritionSummaryCard 
          nutrition={nutritionData} 
          goals={nutritionGoals} 
          onLogMeals={handleLogMeals}
        />
      </View>

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
