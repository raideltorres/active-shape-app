import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';

import { OptionPicker, Button, BackButton } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const HealthInfoStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const healthInfo = profileData?.onboarding?.healthInformation || {};

  const [medicalConditions, setMedicalConditions] = useState(healthInfo.medicalConditions || []);
  const [medicalConditionsOtherSelected, setMedicalConditionsOtherSelected] = useState(!!healthInfo.medicalConditionsOther);
  const [medicalConditionsOther, setMedicalConditionsOther] = useState(healthInfo.medicalConditionsOther || '');

  const [medications, setMedications] = useState(healthInfo.medications || []);
  const [medicationsOtherSelected, setMedicationsOtherSelected] = useState(!!healthInfo.medicationsOther);
  const [medicationsOther, setMedicationsOther] = useState(healthInfo.medicationsOther || '');

  const [injuries, setInjuries] = useState(healthInfo.injuries || []);
  const [injuriesOtherSelected, setInjuriesOtherSelected] = useState(!!healthInfo.injuriesOther);
  const [injuriesOther, setInjuriesOther] = useState(healthInfo.injuriesOther || '');

  const medicalOptions = useMemo(
    () => (optionsData?.medicalConditions || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const medicationOptions = useMemo(
    () => (optionsData?.medications || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const injuryOptions = useMemo(
    () => (optionsData?.injuries || []).filter((o) => !/^other$/i.test(o.text)),
    [optionsData],
  );

  const handleSubmit = () => {
    const goalWeight = profileData?.goalWeight || profileData?.weight;

    onSubmit({
      goalWeight,
      onboarding: {
        ...profileData?.onboarding,
        finished: true,
        onboardingStep: 7,
        healthInformation: {
          ...profileData?.onboarding?.healthInformation,
          medicalConditions,
          medicalConditionsOther: medicalConditionsOtherSelected ? medicalConditionsOther : undefined,
          medications,
          medicationsOther: medicationsOtherSelected ? medicationsOther : undefined,
          injuries,
          injuriesOther: injuriesOtherSelected ? injuriesOther : undefined,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        <OptionPicker
          options={medicalOptions}
          value={medicalConditions}
          onChange={setMedicalConditions}
          multiple
          showNone
          showOther
          otherSelected={medicalConditionsOtherSelected}
          onOtherToggle={setMedicalConditionsOtherSelected}
        />
        {medicalConditionsOtherSelected && (
          <TextInput
            style={styles.otherInput}
            value={medicalConditionsOther}
            onChangeText={setMedicalConditionsOther}
            placeholder="Please specify..."
            placeholderTextColor={colors.alto}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <OptionPicker
          options={medicationOptions}
          value={medications}
          onChange={setMedications}
          multiple
          showNone
          showOther
          otherSelected={medicationsOtherSelected}
          onOtherToggle={setMedicationsOtherSelected}
        />
        {medicationsOtherSelected && (
          <TextInput
            style={styles.otherInput}
            value={medicationsOther}
            onChangeText={setMedicationsOther}
            placeholder="Please specify..."
            placeholderTextColor={colors.alto}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Injuries or Physical Limitations</Text>
        <OptionPicker
          options={injuryOptions}
          value={injuries}
          onChange={setInjuries}
          multiple
          showNone
          showOther
          otherSelected={injuriesOtherSelected}
          onOtherToggle={setInjuriesOtherSelected}
        />
        {injuriesOtherSelected && (
          <TextInput
            style={styles.otherInput}
            value={injuriesOther}
            onChangeText={setInjuriesOther}
            placeholder="Please specify..."
            placeholderTextColor={colors.alto}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={loading ? 'Finishing...' : 'Complete Setup'}
          onPress={handleSubmit}
          disabled={loading}
          icon="checkmark-circle"
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

export default HealthInfoStep;
