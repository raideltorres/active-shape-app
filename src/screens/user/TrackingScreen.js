import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  useGetProfileQuery,
  useGetTrackingsQuery,
  useCreateTrackingMutation,
} from '../../store/api';
import { DateSelector, TrackerNavigation } from '../../components/molecules';
import { colors, spacing, typography } from '../../theme';
import { getCurrentDate } from '../../utils/date';
import { formatWeightKg } from '../../utils/measure';
import {
  WaterTrackerSection,
  WeightTrackerSection,
  NutritionTrackerSection,
  StepsTrackerSection,
  ExerciseTrackerSection,
} from './tracking';

const TRACKER_IDS = {
  WATER: 'water',
  WEIGHT: 'weight',
  NUTRITION: 'nutrition',
  ACTIVITY: 'activity',
};

const TrackingScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weightInputStr, setWeightInputStr] = useState('');
  const [activeTracker, setActiveTracker] = useState(TRACKER_IDS.WATER);
  const prevDateRef = React.useRef(selectedDate);

  const [caloriesConsumed, setCaloriesConsumed] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: trackingData = [] } = useGetTrackingsQuery(
    profile?._id,
    { skip: !profile?._id },
  );
  const [createTracking, { isLoading: saving }] = useCreateTrackingMutation();

  const loading = profileLoading;

  const todayData = useMemo(
    () => trackingData?.find((r) => r.date === selectedDate) || {},
    [trackingData, selectedDate],
  );

  useEffect(() => {
    setCaloriesConsumed(String(todayData.caloriesConsumed ?? ''));
    setCaloriesBurned(String(todayData.caloriesBurned ?? ''));
    setProteins(String(todayData.proteins ?? ''));
    setCarbs(String(todayData.carbs ?? ''));
    setFats(String(todayData.fats ?? ''));
  }, [selectedDate, todayData.caloriesConsumed, todayData.caloriesBurned, todayData.proteins, todayData.carbs, todayData.fats]);

  const trackersList = useMemo(() => {
    const waterConsumed = todayData.water || 0;
    const weightValue = todayData.weight;
    const caloriesVal = todayData.caloriesConsumed || 0;
    const stepsCount = todayData.steps || 0;

    return [
      {
        id: TRACKER_IDS.WATER,
        label: 'Water',
        statusText: waterConsumed > 0 ? `${(waterConsumed / 1000).toFixed(1)}L` : '—',
        isTracked: waterConsumed > 0,
      },
      {
        id: TRACKER_IDS.WEIGHT,
        label: 'Weight',
        statusText: weightValue != null ? `${weightValue}kg` : '—',
        isTracked: weightValue != null,
      },
      {
        id: TRACKER_IDS.NUTRITION,
        label: 'Nutrition',
        statusText: caloriesVal > 0 ? `${caloriesVal} kcal` : '—',
        isTracked: caloriesVal > 0,
      },
      {
        id: TRACKER_IDS.ACTIVITY,
        label: 'Activity',
        statusText: stepsCount > 0 ? `${stepsCount.toLocaleString()} steps` : '—',
        isTracked: stepsCount > 0,
      },
    ];
  }, [todayData]);

  const saveTrackingField = useCallback(async (field, value) => {
    if (!profile?._id) return;
    try {
      await createTracking({ userId: profile._id, date: selectedDate, field, value }).unwrap();
    } catch (e) {
      if (__DEV__) console.error('Save tracking error:', e);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  }, [profile?._id, selectedDate, createTracking]);

  const initialWeight = profile?.weight ?? profile?.personalizedPlan?.weightPlan?.currentWeight ?? null;
  const goalWeight = profile?.goalWeight ?? profile?.personalizedPlan?.weightPlan?.goalWeight ?? null;
  const waterGoalMl = useMemo(() => Math.round((profile?.personalizedPlan?.hydrationPlan?.dailyWaterGoal ?? 2.5) * 1000), [profile]);
  const dailyStepsGoal = profile?.personalizedPlan?.activityPlan?.dailyStepsGoal || 10000;
  const weightChartData = useMemo(() => (trackingData || []).filter((r) => r.weight != null), [trackingData]);
  const displayWeight = useMemo(() => {
    const n = parseFloat(weightInputStr.replace(',', '.'), 10);
    return !Number.isNaN(n) ? n : (todayData.weight ?? initialWeight ?? 70);
  }, [weightInputStr, todayData.weight, initialWeight]);
  const weightInputValue =
    weightInputStr ||
    (todayData.weight != null
      ? formatWeightKg(todayData.weight)
      : initialWeight != null
        ? formatWeightKg(initialWeight)
        : '70.0');

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    setWeightInputStr('');
  }, []);

  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      prevDateRef.current = selectedDate;
      setWeightInputStr('');
    }
  }, [selectedDate]);

  const onWeightInputChange = useCallback((t) => {
    setWeightInputStr(t);
  }, []);

  const onWeightSave = useCallback(async () => {
    const num = parseFloat(String(displayWeight).replace(',', '.'), 10);
    if (Number.isNaN(num)) return;
    await saveTrackingField('weight', parseFloat(formatWeightKg(num)));
    setWeightInputStr('');
  }, [saveTrackingField, displayWeight]);

  const onNutritionSave = useCallback(async () => {
    if (!profile?._id) return;
    const consumed = parseInt(caloriesConsumed, 10) || 0;
    const burned = parseInt(caloriesBurned, 10) || 0;
    const dC = consumed - (todayData.caloriesConsumed || 0);
    const dB = burned - (todayData.caloriesBurned || 0);
    try {
      if (dC !== 0) await createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesConsumed', value: dC }).unwrap();
      if (dB !== 0) await createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesBurned', value: dB }).unwrap();
    } catch (e) {
      if (__DEV__) console.error('Save nutrition error:', e);
      Alert.alert('Error', 'Failed to save calories.');
    }
  }, [profile?._id, selectedDate, caloriesConsumed, caloriesBurned, todayData.caloriesConsumed, todayData.caloriesBurned, createTracking]);

  const onFoodAnalyzed = useCallback(
    async (analysis) => {
      if (!analysis?.totalNutrition || !profile?._id) return;
      const { totalNutrition } = analysis;
      try {
        await Promise.all([
          createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesConsumed', value: totalNutrition.calories ?? 0 }).unwrap(),
          createTracking({ userId: profile._id, date: selectedDate, field: 'proteins', value: totalNutrition.proteins ?? 0 }).unwrap(),
          createTracking({ userId: profile._id, date: selectedDate, field: 'carbs', value: totalNutrition.carbs ?? 0 }).unwrap(),
          createTracking({ userId: profile._id, date: selectedDate, field: 'fats', value: totalNutrition.fats ?? 0 }).unwrap(),
        ]);
        Alert.alert('Success', `Added ${totalNutrition.calories ?? 0} kcal and macros to your daily tracking.`);
      } catch (e) {
        if (__DEV__) console.error('Log food analysis error:', e);
        Alert.alert('Error', e?.message || 'Failed to log food. Please try again.');
      }
    },
    [profile?._id, selectedDate, createTracking],
  );

  const onMacrosSave = useCallback(async () => {
    if (!profile?._id) return;
    const p = parseInt(proteins, 10) || 0;
    const c = parseInt(carbs, 10) || 0;
    const f = parseInt(fats, 10) || 0;
    const dP = p - (todayData.proteins || 0);
    const dC = c - (todayData.carbs || 0);
    const dF = f - (todayData.fats || 0);
    try {
      if (dP !== 0) await createTracking({ userId: profile._id, date: selectedDate, field: 'proteins', value: dP }).unwrap();
      if (dC !== 0) await createTracking({ userId: profile._id, date: selectedDate, field: 'carbs', value: dC }).unwrap();
      if (dF !== 0) await createTracking({ userId: profile._id, date: selectedDate, field: 'fats', value: dF }).unwrap();
    } catch (e) {
      if (__DEV__) console.error('Save macros error:', e);
      Alert.alert('Error', 'Failed to save macronutrients.');
    }
  }, [profile?._id, selectedDate, proteins, carbs, fats, todayData.proteins, todayData.carbs, todayData.fats, createTracking]);

  const onExerciseAnalyzed = useCallback(
    async (analysis) => {
      if (!analysis || !profile?._id) return;
      const { totalCaloriesBurned = 0, totalDuration = 0 } = analysis;
      try {
        await Promise.all([
          totalCaloriesBurned > 0 && createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesBurned', value: totalCaloriesBurned }).unwrap(),
          totalDuration > 0 && createTracking({ userId: profile._id, date: selectedDate, field: 'exerciseDuration', value: totalDuration }).unwrap(),
        ].filter(Boolean));
        Alert.alert('Success', `Logged ${totalCaloriesBurned} kcal burned and ${totalDuration} min of exercise.`);
      } catch (e) {
        if (__DEV__) console.error('Log exercise error:', e);
        Alert.alert('Error', e?.message || 'Failed to log exercise.');
      }
    },
    [profile?._id, selectedDate, createTracking],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Track Your Daily Metrics</Text>
            <Text style={styles.subtitle}>Select a tracker below to log your daily progress</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateRowSelector}>
              <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} maxDaysBack={5} style={styles.dateSelector} />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('TrackingHistory')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color={colors.mainOrange} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <TrackerNavigation
            trackers={trackersList}
            activeTracker={activeTracker}
            onTrackerSelect={setActiveTracker}
          />

          {activeTracker === TRACKER_IDS.WATER && (
            <WaterTrackerSection todayData={todayData} waterGoalLiters={waterGoalMl} onDrink={(amount) => saveTrackingField('water', amount)} saving={saving} />
          )}
          {activeTracker === TRACKER_IDS.WEIGHT && (
            <WeightTrackerSection
              weightInputValue={weightInputValue}
              onWeightInputChange={onWeightInputChange}
              onWeightSave={onWeightSave}
              saving={saving}
              weightChartData={weightChartData}
              initialWeight={initialWeight}
              goalWeight={goalWeight}
              profileCreatedAt={profile?.createdAt ?? null}
              displayWeightNum={displayWeight}
            />
          )}
          {activeTracker === TRACKER_IDS.NUTRITION && (
            <NutritionTrackerSection
              userId={profile?._id}
              onFoodAnalyzed={onFoodAnalyzed}
              caloriesConsumed={caloriesConsumed}
              caloriesBurned={caloriesBurned}
              proteins={proteins}
              carbs={carbs}
              fats={fats}
              onCaloriesConsumedChange={setCaloriesConsumed}
              onCaloriesBurnedChange={setCaloriesBurned}
              onProteinsChange={setProteins}
              onCarbsChange={setCarbs}
              onFatsChange={setFats}
              onNutritionSave={onNutritionSave}
              onMacrosSave={onMacrosSave}
              saving={saving}
            />
          )}
          {activeTracker === TRACKER_IDS.ACTIVITY && (
            <View>
              <StepsTrackerSection
                totalSteps={todayData.steps || 0}
                dailyGoal={dailyStepsGoal}
                onSave={(steps) => saveTrackingField('steps', steps)}
                saving={saving}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>AI EXERCISE ANALYSIS</Text>
                <View style={styles.dividerLine} />
              </View>

              <ExerciseTrackerSection
                userWeight={todayData.weight || profile?.weight || 70}
                onExerciseAnalyzed={onExerciseAnalyzed}
                saving={saving}
              />
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.alabaster },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.tabBarPadding },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: '#26466B', textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.raven, marginTop: 4, textAlign: 'center' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dateRowSelector: {
    flex: 1,
  },
  dateSelector: {
    marginBottom: 0,
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.alto,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  editButtonText: {
    ...typography.caption,
    color: colors.mineShaft,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.mercury,
  },
  dividerText: {
    ...typography.caption,
    color: colors.raven,
    paddingHorizontal: spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default TrackingScreen;
