import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { ValuePicker, BodyCompositionPicker, BmiGauge } from '../../../components/molecules';
import { Button, BackButton } from '../../../components/atoms';
import { calculateBmi } from '../../../utils/bmi';
import { colors, spacing, typography } from '../../../theme';

const formatWeight = (n) => String(parseFloat(Number(n).toFixed(1)));
const formatHeight = (n) => String(parseFloat(Number(n).toFixed(1)));
const kgToLbs = (kg) => kg * 2.20462;
const cmToInches = (cm) => cm / 2.54;

const MetricsStep = ({ onSubmit, onBack, profileData, loading }) => {
  const [height, setHeight] = useState(profileData?.height || 170);
  const [weight, setWeight] = useState(profileData?.weight || 70);
  const [bodyComposition, setBodyComposition] = useState(profileData?.bodyComposition || '');

  const bmi = useMemo(
    () => calculateBmi(weight, height),
    [weight, height],
  );

  const handleSubmit = () => {
    if (!bodyComposition) {
      Alert.alert('Required', 'Please select your body composition.');
      return;
    }

    onSubmit({
      height,
      weight,
      bodyComposition,
      onboarding: {
        ...profileData?.onboarding,
        onboardingStep: 3,
      },
    });
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <View style={styles.section}>
        <ValuePicker
          title="Height"
          value={formatHeight(height)}
          onChange={(v) => setHeight(parseFloat(v) || 0)}
          min={50}
          max={300}
          step={0.5}
          unit="cm"
          alternativeUnit="in"
          convertToAlternative={cmToInches}
          convertFromAlternative={(v) => v * 2.54}
          formatMainValue={formatHeight}
        />
      </View>

      <View style={styles.section}>
        <ValuePicker
          title="Weight"
          value={formatWeight(weight)}
          onChange={(v) => setWeight(parseFloat(v) || 0)}
          min={20}
          max={200}
          step={0.5}
          unit="kg"
          alternativeUnit="lbs"
          convertToAlternative={kgToLbs}
          convertFromAlternative={(v) => v / 2.20462}
          formatMainValue={formatWeight}
        />
      </View>

      {bmi > 0 && (
        <View style={styles.section}>
          <BmiGauge bmi={bmi} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Composition</Text>
        <BodyCompositionPicker value={bodyComposition} onChange={setBodyComposition} />
      </View>

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
  footer: {
    marginTop: spacing.lg,
  },
});

export default MetricsStep;
