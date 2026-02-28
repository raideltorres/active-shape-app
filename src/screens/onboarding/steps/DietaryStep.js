import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

import { OptionPicker, Button, BackButton } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const DietaryStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const healthGoals = profileData?.onboarding?.healthAndFitnessGoals || {};
  const healthInfo = profileData?.onboarding?.healthInformation || {};

  const [dietaryPreference, setDietaryPreference] = useState(healthGoals.dietaryPreference || '');
  const [allergies, setAllergies] = useState(healthInfo.allergies || []);
  const [allergiesOtherSelected, setAllergiesOtherSelected] = useState(!!healthInfo.allergiesOther);
  const [allergiesOther, setAllergiesOther] = useState(healthInfo.allergiesOther || '');

  const dietaryOptions = useMemo(
    () => (optionsData?.dietaryPreferences || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const allergyOptions = useMemo(
    () => (optionsData?.allergies || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const handleSubmit = () => {
    if (!dietaryPreference) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select a dietary preference.' });
      return;
    }

    onSubmit({
      onboarding: {
        ...profileData?.onboarding,
        onboardingStep: 5,
        healthAndFitnessGoals: {
          ...profileData?.onboarding?.healthAndFitnessGoals,
          dietaryPreference,
        },
        healthInformation: {
          ...profileData?.onboarding?.healthInformation,
          allergies,
          allergiesOther: allergiesOtherSelected ? allergiesOther : undefined,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preference</Text>
        <OptionPicker
          options={dietaryOptions}
          value={dietaryPreference}
          onChange={setDietaryPreference}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allergies & Intolerances</Text>
        <OptionPicker
          options={allergyOptions}
          value={allergies}
          onChange={setAllergies}
          multiple
          showNone
          showOther
          otherSelected={allergiesOtherSelected}
          onOtherToggle={setAllergiesOtherSelected}
        />
        {allergiesOtherSelected && (
          <TextInput
            style={styles.otherInput}
            value={allergiesOther}
            onChangeText={setAllergiesOther}
            placeholder="Please specify..."
            placeholderTextColor={colors.alto}
          />
        )}
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
  otherInput: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  footer: {
    marginTop: spacing.xl,
  },
});

export default DietaryStep;
