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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userService } from '../../services/api';
import { DateSelector, TrackerNavigation, Card } from '../../components/molecules';
import { colors, spacing, typography } from '../../theme';
import { getCurrentDate } from '../../utils/date';
import {
  WaterTrackerSection,
  WeightTrackerSection,
  NutritionTrackerSection,
} from './tracking';

const TRACKER_IDS = { WATER: 'water', WEIGHT: 'weight', NUTRITION: 'nutrition' };

const TrackingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weightInputStr, setWeightInputStr] = useState('');
  const [activeTracker, setActiveTracker] = useState(TRACKER_IDS.WATER);
  const prevDateRef = React.useRef(selectedDate);

  const [profile, setProfile] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [caloriesConsumed, setCaloriesConsumed] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const profileData = await userService.getProfile();
      setProfile(profileData);
      const data = profileData?._id ? await userService.getTrackings(profileData._id) : [];
      setTrackingData(Array.isArray(data) ? data : []);
    } catch (e) {
      if (__DEV__) console.error('Tracking fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const trackersList = useMemo(() => [
    { id: TRACKER_IDS.WATER, label: 'Water', statusText: (todayData.water || 0) > 0 ? `${((todayData.water || 0) / 1000).toFixed(1)}L` : '—', isTracked: (todayData.water || 0) > 0 },
    { id: TRACKER_IDS.WEIGHT, label: 'Weight', statusText: todayData.weight != null ? `${todayData.weight} kg` : '—', isTracked: todayData.weight != null },
    { id: TRACKER_IDS.NUTRITION, label: 'Nutrition', statusText: (todayData.caloriesConsumed || 0) > 0 ? `${todayData.caloriesConsumed} kcal` : '—', isTracked: (todayData.caloriesConsumed || 0) > 0 },
  ], [todayData]);

  const saveTrackingField = useCallback(async (field, value) => {
    if (!profile?._id) return;
    setSaving(true);
    try {
      await userService.createTracking({ userId: profile._id, date: selectedDate, field, value });
      await fetchData();
    } catch (e) {
      if (__DEV__) console.error('Save tracking error:', e);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [profile?._id, selectedDate, fetchData]);

  const initialWeight = profile?.weight ?? profile?.personalizedPlan?.weightPlan?.currentWeight ?? null;
  const goalWeight = profile?.goalWeight ?? profile?.personalizedPlan?.weightPlan?.goalWeight ?? null;
  const waterGoalMl = useMemo(() => Math.round((profile?.personalizedPlan?.hydrationPlan?.dailyWaterGoal ?? 2.5) * 1000), [profile]);
  const weightChartData = useMemo(() => (trackingData || []).filter((r) => r.weight != null), [trackingData]);
  const displayWeight = useMemo(() => {
    const n = parseFloat(weightInputStr.replace(',', '.'), 10);
    return !Number.isNaN(n) ? n : (todayData.weight ?? initialWeight ?? 70);
  }, [weightInputStr, todayData.weight, initialWeight]);
  const weightInputValue = weightInputStr || String(todayData.weight ?? initialWeight ?? 70);

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
    await saveTrackingField('weight', num);
    setWeightInputStr('');
  }, [saveTrackingField, displayWeight]);

  const onNutritionSave = useCallback(async () => {
    if (!profile?._id) return;
    const consumed = parseInt(caloriesConsumed, 10) || 0;
    const burned = parseInt(caloriesBurned, 10) || 0;
    const dC = consumed - (todayData.caloriesConsumed || 0);
    const dB = burned - (todayData.caloriesBurned || 0);
    setSaving(true);
    try {
      if (dC !== 0) await userService.createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesConsumed', value: dC });
      if (dB !== 0) await userService.createTracking({ userId: profile._id, date: selectedDate, field: 'caloriesBurned', value: dB });
      await fetchData();
    } catch (e) {
      if (__DEV__) console.error('Save nutrition error:', e);
      Alert.alert('Error', 'Failed to save calories.');
    } finally {
      setSaving(false);
    }
  }, [profile?._id, selectedDate, caloriesConsumed, caloriesBurned, todayData.caloriesConsumed, todayData.caloriesBurned, fetchData]);

  const onMacrosSave = useCallback(async () => {
    if (!profile?._id) return;
    const p = parseInt(proteins, 10) || 0;
    const c = parseInt(carbs, 10) || 0;
    const f = parseInt(fats, 10) || 0;
    const dP = p - (todayData.proteins || 0);
    const dC = c - (todayData.carbs || 0);
    const dF = f - (todayData.fats || 0);
    setSaving(true);
    try {
      if (dP !== 0) await userService.createTracking({ userId: profile._id, date: selectedDate, field: 'proteins', value: dP });
      if (dC !== 0) await userService.createTracking({ userId: profile._id, date: selectedDate, field: 'carbs', value: dC });
      if (dF !== 0) await userService.createTracking({ userId: profile._id, date: selectedDate, field: 'fats', value: dF });
      await fetchData();
    } catch (e) {
      if (__DEV__) console.error('Save macros error:', e);
      Alert.alert('Error', 'Failed to save macronutrients.');
    } finally {
      setSaving(false);
    }
  }, [profile?._id, selectedDate, proteins, carbs, fats, todayData.proteins, todayData.carbs, todayData.fats, fetchData]);

  const trackerTitle = activeTracker === TRACKER_IDS.WEIGHT ? 'Weight Tracking' : 'Nutrition Tracking';

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
          <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} maxDaysBack={5} />
          <TrackerNavigation trackers={trackersList} activeTracker={activeTracker} onTrackerSelect={setActiveTracker} />
          {activeTracker !== TRACKER_IDS.WATER && <Text style={styles.trackerTitle}>{trackerTitle}</Text>}
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
            />
          )}
          {activeTracker === TRACKER_IDS.NUTRITION && (
            <NutritionTrackerSection
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
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.alabaster },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: '#26466B', textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.raven, marginTop: 4, textAlign: 'center' },
  trackerTitle: { ...typography.h4, color: colors.mineShaft, marginBottom: spacing.md },
});

export default TrackingScreen;
