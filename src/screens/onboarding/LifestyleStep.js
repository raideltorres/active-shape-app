import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import Button from '../../components/atoms/Button';
import LabeledSlider from '../../components/atoms/LabeledSlider';
import { colors, spacing, typography } from '../../theme';

const DAILY_ACTIVITY_LABELS = [
  'Sedentary (desk job, mostly sitting)',
  'Lightly active (some walking, errands)',
  'Moderately active (on feet most of the day)',
  'Very active (physical labor, manual work)',
];

const EXERCISE_FREQ_LABELS = [
  'None / Rarely',
  'Light (1-3 days/week)',
  'Moderate (3-5 days/week)',
  'Heavy (6-7 days/week)',
  'Intense (twice daily / athlete)',
];

const WATER_INTAKE_LABELS = [
  'Less than 1 liter per day',
  '1-2 liters per day',
  '2-3 liters per day',
  'More than 3 liters per day',
];

const SLEEP_LABELS = [
  'Less than 5 hours per night',
  '5-6 hours per night',
  '6-7 hours per night',
  '7-8 hours per night',
  'More than 8 hours per night',
];

const LifestyleStep = ({ onSubmit, onBack, profileData, loading }) => {
  const saved = profileData?.onboarding?.currentLifestyleAndHabits || {};

  const [dailyActivityLevel, setDailyActivityLevel] = useState(
    saved.dailyActivityLevel ?? 0,
  );
  const [exerciseFrequency, setExerciseFrequency] = useState(
    saved.exerciseFrequency ?? 0,
  );
  const [waterIntake, setWaterIntake] = useState(saved.waterIntake ?? 0);
  const [sleepPatterns, setSleepPatterns] = useState(saved.sleepPatterns ?? 0);

  const handleSubmit = useCallback(() => {
    onSubmit({
      onboarding: {
        ...(profileData?.onboarding || {}),
        onboardingStep: 6,
        currentLifestyleAndHabits: {
          dailyActivityLevel,
          exerciseFrequency,
          waterIntake,
          sleepPatterns,
        },
      },
    });
  }, [
    dailyActivityLevel,
    exerciseFrequency,
    waterIntake,
    sleepPatterns,
    profileData,
    onSubmit,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        These help us understand your daily routine and create a plan that fits
        your lifestyle.
      </Text>

      <LabeledSlider
        title="Daily Activity Level"
        value={dailyActivityLevel}
        onChange={setDailyActivityLevel}
        labels={DAILY_ACTIVITY_LABELS}
      />

      <LabeledSlider
        title="Exercise Frequency"
        value={exerciseFrequency}
        onChange={setExerciseFrequency}
        labels={EXERCISE_FREQ_LABELS}
      />

      <LabeledSlider
        title="Water Intake"
        value={waterIntake}
        onChange={setWaterIntake}
        labels={WATER_INTAKE_LABELS}
      />

      <LabeledSlider
        title="Sleep Patterns"
        value={sleepPatterns}
        onChange={setSleepPatterns}
        labels={SLEEP_LABELS}
      />

      <View style={styles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          style={styles.backBtn}
          disabled={loading}
        />
        <Button
          title={loading ? 'Saving...' : 'Continue'}
          onPress={handleSubmit}
          style={styles.nextBtn}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  intro: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

export default LifestyleStep;
