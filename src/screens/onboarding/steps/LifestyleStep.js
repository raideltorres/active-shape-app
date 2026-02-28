import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { LabeledSlider, Button, BackButton } from '../../../components/atoms';
import { spacing } from '../../../theme';

const ACTIVITY_LABELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const EXERCISE_LABELS = ['None', '1\u20132 days/week', '3\u20134 days/week', '5\u20136 days/week', 'Daily'];
const WATER_LABELS = ['< 1 L', '1\u20131.5 L', '1.5\u20132 L', '2\u20132.5 L', '3+ L'];
const SLEEP_LABELS = ['< 5 hrs', '5\u20136 hrs', '6\u20137 hrs', '7\u20138 hrs', '8+ hrs'];

const LifestyleStep = ({ onSubmit, onBack, profileData, loading }) => {
  const habits = profileData?.onboarding?.currentLifestyleAndHabits || {};

  const [dailyActivityLevel, setDailyActivityLevel] = useState(habits.dailyActivityLevel ?? 2);
  const [exerciseFrequency, setExerciseFrequency] = useState(habits.exerciseFrequency ?? 2);
  const [waterIntake, setWaterIntake] = useState(habits.waterIntake ?? 2);
  const [sleepPatterns, setSleepPatterns] = useState(habits.sleepPatterns ?? 3);

  const handleSubmit = () => {
    onSubmit({
      onboarding: {
        ...profileData?.onboarding,
        onboardingStep: 6,
        currentLifestyleAndHabits: {
          dailyActivityLevel,
          exerciseFrequency,
          waterIntake,
          sleepPatterns,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <LabeledSlider
        title="Daily Activity Level"
        value={dailyActivityLevel}
        onChange={setDailyActivityLevel}
        labels={ACTIVITY_LABELS}
      />

      <LabeledSlider
        title="Exercise Frequency"
        value={exerciseFrequency}
        onChange={setExerciseFrequency}
        labels={EXERCISE_LABELS}
      />

      <LabeledSlider
        title="Daily Water Intake"
        value={waterIntake}
        onChange={setWaterIntake}
        labels={WATER_LABELS}
      />

      <LabeledSlider
        title="Sleep Patterns"
        value={sleepPatterns}
        onChange={setSleepPatterns}
        labels={SLEEP_LABELS}
      />

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
  footer: {
    marginTop: spacing.lg,
  },
});

export default LifestyleStep;
