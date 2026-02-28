import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Toast from 'react-native-toast-message';

import { ValuePicker, OnboardingFastingPlanCard } from '../../../components/molecules';
import { OptionPicker, Button, BackButton } from '../../../components/atoms';
import { useGetFastingPlansQuery } from '../../../store/api';
import { calculateGoalWeight } from '../../../utils/goalWeight';
import { colors, spacing, typography } from '../../../theme';

const EATING_SCHEDULE_OPTIONS = [
  { value: 'morning', text: 'Morning person' },
  { value: 'evening', text: 'Evening person' },
  { value: 'flexible', text: 'Flexible' },
];

const FASTING_EXPERIENCE_OPTIONS = [
  { value: 'beginner', text: 'Beginner' },
  { value: 'occasional', text: 'Occasional' },
  { value: 'regular', text: 'Fast regularly' },
];

const TIMELINE_RANGES = [
  { value: '1-3m', label: '1\u20133 months', minMonths: 1, maxMonths: 3 },
  { value: '3-6m', label: '3\u20136 months', minMonths: 3, maxMonths: 6 },
  { value: '6-12m', label: '6\u201312 months', minMonths: 6, maxMonths: 12 },
  { value: '12+m', label: '12+ months', minMonths: 12, maxMonths: 24 },
];

const formatWeight = (n) => String(parseFloat(Number(n).toFixed(1)));
const kgToLbs = (kg) => kg * 2.20462;

const GoalsStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const goals = profileData?.onboarding?.healthAndFitnessGoals || {};

  const [primaryGoal, setPrimaryGoal] = useState(goals.primaryGoal || '');
  const [fitnessPreferences, setFitnessPreferences] = useState(goals.fitnessPreferences || []);
  const [goalTimeline, setGoalTimeline] = useState(goals.goalTimeline || '');
  const [preferredEatingSchedule, setPreferredEatingSchedule] = useState(goals.preferredEatingSchedule || '');
  const [usesIntermittentFasting, setUsesIntermittentFasting] = useState(goals.usesIntermittentFasting || false);
  const [fastingExperience, setFastingExperience] = useState(goals.fastingExperience || '');
  const [selectedFastingPlan, setSelectedFastingPlan] = useState(
    profileData?.fastingSettings?.fastingPlanId || null,
  );

  const autoGoalWeight = useMemo(() => {
    if (!profileData?.weight || !profileData?.height || !primaryGoal) return profileData?.goalWeight || 70;
    return calculateGoalWeight({
      weight: profileData.weight,
      height: profileData.height,
      bodyComposition: profileData.bodyComposition,
      primaryGoalCode: primaryGoal,
    });
  }, [primaryGoal, profileData]);

  const [goalWeight, setGoalWeight] = useState(profileData?.goalWeight || autoGoalWeight);
  const goalInitRef = useRef(false);

  useEffect(() => {
    if (!primaryGoal) return;
    if (!goalInitRef.current) {
      goalInitRef.current = true;
      return;
    }
    setGoalWeight(autoGoalWeight);
  }, [primaryGoal, autoGoalWeight]);

  const { data: fastingPlansData } = useGetFastingPlansQuery(undefined, {
    skip: fastingExperience !== 'regular',
  });

  const sortedFastingPlans = useMemo(() => {
    if (!fastingPlansData) return [];
    return [...fastingPlansData].sort((a, b) => (a.fastingHours || 0) - (b.fastingHours || 0));
  }, [fastingPlansData]);

  useEffect(() => {
    if (fastingExperience !== 'regular') setSelectedFastingPlan(null);
  }, [fastingExperience]);

  const primaryGoalOptions = useMemo(
    () => (optionsData?.primaryGoals || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const fitnessOptions = useMemo(
    () => (optionsData?.fitnessPreferences || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const handleSubmit = () => {
    if (!primaryGoal) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select a primary goal.' });
      return;
    }
    if (fitnessPreferences.length === 0) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select at least one fitness preference.' });
      return;
    }
    if (!preferredEatingSchedule) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select your preferred eating schedule.' });
      return;
    }

    const payload = {
      goalWeight,
      onboarding: {
        ...profileData?.onboarding,
        onboardingStep: 4,
        healthAndFitnessGoals: {
          ...profileData?.onboarding?.healthAndFitnessGoals,
          primaryGoal,
          fitnessPreferences,
          goalTimeline: goalTimeline || undefined,
          usesIntermittentFasting,
          fastingExperience: usesIntermittentFasting ? fastingExperience : undefined,
          preferredEatingSchedule,
        },
      },
    };

    if (selectedFastingPlan) {
      payload.fastingSettings = {
        ...profileData?.fastingSettings,
        fastingPlanId: selectedFastingPlan,
      };
    }

    onSubmit(payload);
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Goal</Text>
        <OptionPicker
          options={primaryGoalOptions}
          value={primaryGoal}
          onChange={setPrimaryGoal}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Preferences</Text>
        <OptionPicker
          options={fitnessOptions}
          value={fitnessPreferences}
          onChange={setFitnessPreferences}
          multiple
        />
      </View>

      <View style={styles.section}>
        <ValuePicker
          title="Target Weight"
          value={formatWeight(goalWeight)}
          onChange={(v) => setGoalWeight(parseFloat(v) || 0)}
          min={30}
          max={200}
          step={0.5}
          unit="kg"
          alternativeUnit="lbs"
          convertToAlternative={kgToLbs}
          convertFromAlternative={(v) => v / 2.20462}
          formatMainValue={formatWeight}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <Text style={styles.hint}>
          Starting slow is usually the best approach — gradual changes are easier to maintain and lead to lasting results.
        </Text>
        <OptionPicker
          options={TIMELINE_RANGES}
          value={goalTimeline}
          onChange={setGoalTimeline}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Eating Schedule</Text>
        <OptionPicker
          options={EATING_SCHEDULE_OPTIONS}
          value={preferredEatingSchedule}
          onChange={setPreferredEatingSchedule}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Do you practice intermittent fasting?</Text>
          <Switch
            value={usesIntermittentFasting}
            onValueChange={setUsesIntermittentFasting}
            trackColor={{ true: colors.mainOrange, false: colors.gallery }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {usesIntermittentFasting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fasting Experience</Text>
          <OptionPicker
            options={FASTING_EXPERIENCE_OPTIONS}
            value={fastingExperience}
            onChange={setFastingExperience}
          />
        </View>
      )}

      {fastingExperience === 'regular' && sortedFastingPlans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Fasting Plan</Text>
          <Text style={styles.hint}>
            Pick the fasting plan you would like to follow — you can always change it later.
          </Text>
          {sortedFastingPlans.map((plan) => (
            <OnboardingFastingPlanCard
              key={plan._id}
              {...plan}
              selected={selectedFastingPlan === plan._id}
              onSelect={setSelectedFastingPlan}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={loading ? 'Saving...' : 'Continue'}
          onPress={handleSubmit}
          disabled={loading}
          icon="arrow-forward"
          iconPosition="right"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mainBlue,
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    ...typography.body,
    color: colors.mineShaft,
    flex: 1,
    marginRight: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
  },
});

export default GoalsStep;
