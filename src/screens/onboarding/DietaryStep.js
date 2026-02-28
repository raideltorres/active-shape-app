import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import Button from '../../components/atoms/Button';
import FormInput from '../../components/atoms/FormInput';
import OptionPicker from '../../components/atoms/OptionPicker';
import { colors, spacing, typography } from '../../theme';
import { DIET_OPTIONS } from '../../utils/measure';

const DIET_PICKER_OPTIONS = DIET_OPTIONS.map((d) => ({
  value: d.value,
  text: d.label,
}));

const DietaryStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const savedGoals = profileData?.onboarding?.healthAndFitnessGoals || {};
  const savedHealth = profileData?.onboarding?.healthInformation || {};

  const [dietaryPreference, setDietaryPreference] = useState(
    savedGoals.dietaryPreference || 'none',
  );
  const [allergies, setAllergies] = useState(savedHealth.allergies || []);
  const [showAllergiesOther, setShowAllergiesOther] = useState(
    savedHealth.allergies?.includes('other') || false,
  );
  const [allergiesOther, setAllergiesOther] = useState(
    savedHealth.allergiesOther || '',
  );

  const allergyOptions = (optionsData?.allergies || []).map((a) => ({
    value: a.value,
    text: a.text,
  }));

  const handleAllergiesChange = useCallback(
    (val) => {
      setAllergies(val);
    },
    [],
  );

  const validate = useCallback(() => {
    if (!dietaryPreference) return 'Please select a dietary preference';
    if (showAllergiesOther && !allergiesOther.trim())
      return 'Please specify your other allergies';
    return null;
  }, [dietaryPreference, showAllergiesOther, allergiesOther]);

  const handleSubmit = useCallback(() => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    onSubmit({
      onboarding: {
        ...(profileData?.onboarding || {}),
        onboardingStep: 5,
        healthAndFitnessGoals: {
          ...(profileData?.onboarding?.healthAndFitnessGoals || {}),
          dietaryPreference,
        },
        healthInformation: {
          ...(profileData?.onboarding?.healthInformation || {}),
          allergies,
          allergiesOther: showAllergiesOther ? allergiesOther.trim() : undefined,
        },
      },
    });
  }, [
    validate,
    dietaryPreference,
    allergies,
    showAllergiesOther,
    allergiesOther,
    profileData,
    onSubmit,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dietary Preference</Text>
      <OptionPicker
        options={DIET_PICKER_OPTIONS}
        value={dietaryPreference}
        onChange={setDietaryPreference}
      />

      <Text style={styles.sectionTitle}>Allergies</Text>
      <Text style={styles.hint}>
        These are optional but help us filter recipes and meal plans for you.
      </Text>
      <OptionPicker
        options={allergyOptions}
        value={allergies}
        onChange={handleAllergiesChange}
        multiple
        showNone
        showOther
        otherSelected={showAllergiesOther}
        onOtherToggle={setShowAllergiesOther}
        onNone={() => {
          setAllergies([]);
          setShowAllergiesOther(false);
          setAllergiesOther('');
        }}
      />

      {showAllergiesOther && (
        <FormInput
          label="Other Allergies"
          value={allergiesOther}
          onChangeText={setAllergiesOther}
          placeholder="Specify your allergies..."
        />
      )}

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
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.mineShaft,
    marginTop: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

export default DietaryStep;
