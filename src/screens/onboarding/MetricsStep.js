import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import Button from '../../components/atoms/Button';
import ValuePicker from '../../components/molecules/ValuePicker/ValuePicker';
import BodyCompositionPicker from '../../components/molecules/BodyCompositionPicker/BodyCompositionPicker';
import BmiGaugeWithLabels from '../../components/molecules/BmiGaugeWithLabels/BmiGaugeWithLabels';
import { spacing } from '../../theme';
import {
  USER_DEFAULTS,
  fromCmToFeet,
  fromInchesToCm,
  fromKgToLbs,
  fromLbsToKg,
} from '../../utils/measure';

const MetricsStep = ({ onSubmit, onBack, profileData, loading }) => {
  const [height, setHeight] = useState(profileData?.height || USER_DEFAULTS.height);
  const [weight, setWeight] = useState(profileData?.weight || USER_DEFAULTS.weight);
  const [bodyComposition, setBodyComposition] = useState(
    profileData?.bodyComposition || USER_DEFAULTS.bodyComposition,
  );

  const handleSubmit = useCallback(() => {
    if (height < 50 || height > 300) {
      Alert.alert('Validation', 'Please enter a valid height (50–300 cm).');
      return;
    }
    if (weight < 20 || weight > 300) {
      Alert.alert('Validation', 'Please enter a valid weight (20–300 kg).');
      return;
    }

    onSubmit({
      height,
      weight,
      bodyComposition,
      onboarding: {
        ...(profileData?.onboarding || {}),
        onboardingStep: 3,
      },
    });
  }, [height, weight, bodyComposition, profileData, onSubmit]);

  return (
    <View style={styles.container}>
      <View style={styles.measurements}>
        <ValuePicker
          title="Height"
          description="Set your current height to help calculate accurate calorie requirements and track your body measurements over time."
          value={height}
          onChange={(v) => setHeight(parseFloat(v))}
          min={50}
          max={300}
          step={1}
          unit="cm"
          alternativeUnit="in"
          convertToAlternative={(cm) => fromCmToFeet(cm).totalInches}
          convertFromAlternative={fromInchesToCm}
          formatMainValue={(n) => String(Math.round(n))}
          formatAlternativeValue={(n) => String(Math.round(n))}
        />

        <ValuePicker
          title="Weight"
          description="Set your current weight to help calculate accurate calorie requirements and track your body measurements over time."
          value={weight}
          onChange={(v) => setWeight(parseFloat(v))}
          min={20}
          max={200}
          step={0.1}
          unit="kg"
          alternativeUnit="lbs"
          convertToAlternative={(kg) => fromKgToLbs(kg).lbs}
          convertFromAlternative={fromLbsToKg}
        />
      </View>

      <BodyCompositionPicker
        label="Body Composition"
        question="Help us understand your muscle mass level for more accurate health assessments. Body fat doesn't matter here — a strongman with high muscle mass but also higher body fat should select 'Athletic/Very Muscular'. We use this to adjust your BMI interpretation since muscle weighs more than fat."
        value={bodyComposition}
        onChange={setBodyComposition}
      />

      <BmiGaugeWithLabels
        weight={weight}
        height={height}
        bodyComposition={bodyComposition}
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
    gap: spacing.xl,
  },
  measurements: {
    gap: spacing.lg,
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

export default MetricsStep;
