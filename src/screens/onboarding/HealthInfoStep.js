import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import Button from '../../components/atoms/Button';
import FormInput from '../../components/atoms/FormInput';
import OptionPicker from '../../components/atoms/OptionPicker';
import { colors, spacing, typography } from '../../theme';
import { MEDICATION_OPTIONS, INJURY_OPTIONS, calculateGoalWeight } from '../../utils/measure';

const HealthInfoStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const saved = profileData?.onboarding?.healthInformation || {};

  const [medicalConditions, setMedicalConditions] = useState(
    saved.medicalConditions || [],
  );
  const [showMedCondOther, setShowMedCondOther] = useState(
    saved.medicalConditions?.includes('other') || false,
  );
  const [medicalConditionsOther, setMedicalConditionsOther] = useState(
    saved.medicalConditionsOther || '',
  );

  const [medications, setMedications] = useState(saved.medications || []);
  const [showMedOther, setShowMedOther] = useState(
    saved.medications?.includes('other') || false,
  );
  const [medicationsOther, setMedicationsOther] = useState(
    saved.medicationsOther || '',
  );

  const [injuries, setInjuries] = useState(saved.injuries || []);
  const [showInjuriesOther, setShowInjuriesOther] = useState(
    saved.injuries?.includes('other') || false,
  );
  const [injuriesOther, setInjuriesOther] = useState(
    saved.injuriesOther || '',
  );

  const medCondOptions = (optionsData?.medicalConditions || []).map((m) => ({
    value: m.value,
    text: m.text,
  }));

  const validate = useCallback(() => {
    if (showMedCondOther && !medicalConditionsOther.trim())
      return 'Please specify your other medical conditions';
    if (showMedOther && !medicationsOther.trim())
      return 'Please specify your other medications';
    if (showInjuriesOther && !injuriesOther.trim())
      return 'Please specify your other injuries';
    return null;
  }, [
    showMedCondOther,
    medicalConditionsOther,
    showMedOther,
    medicationsOther,
    showInjuriesOther,
    injuriesOther,
  ]);

  const handleSubmit = useCallback(() => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    let goalWeight = profileData?.goalWeight;
    if (!goalWeight && profileData?.weight && profileData?.height) {
      goalWeight = calculateGoalWeight({
        weight: profileData.weight,
        height: profileData.height,
        bodyComposition: profileData.bodyComposition || 'average',
        primaryGoalCode:
          profileData?.onboarding?.healthAndFitnessGoals?.primaryGoal || 'pg5',
      });
    }

    onSubmit({
      goalWeight,
      onboarding: {
        ...(profileData?.onboarding || {}),
        finished: true,
        onboardingStep: 7,
        healthInformation: {
          ...(profileData?.onboarding?.healthInformation || {}),
          medicalConditions,
          medicalConditionsOther: showMedCondOther
            ? medicalConditionsOther.trim()
            : undefined,
          medications,
          medicationsOther: showMedOther
            ? medicationsOther.trim()
            : undefined,
          injuries,
          injuriesOther: showInjuriesOther
            ? injuriesOther.trim()
            : undefined,
        },
      },
    });
  }, [
    validate,
    profileData,
    medicalConditions,
    showMedCondOther,
    medicalConditionsOther,
    medications,
    showMedOther,
    medicationsOther,
    injuries,
    showInjuriesOther,
    injuriesOther,
    onSubmit,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        This information is optional but helps us create a safer and more
        personalized plan for you.
      </Text>

      <Text style={styles.sectionTitle}>Medical Conditions</Text>
      <OptionPicker
        options={medCondOptions}
        value={medicalConditions}
        onChange={setMedicalConditions}
        multiple
        showNone
        showOther
        otherSelected={showMedCondOther}
        onOtherToggle={setShowMedCondOther}
        onNone={() => {
          setMedicalConditions([]);
          setShowMedCondOther(false);
          setMedicalConditionsOther('');
        }}
      />
      {showMedCondOther && (
        <FormInput
          label="Other Medical Conditions"
          value={medicalConditionsOther}
          onChangeText={setMedicalConditionsOther}
          placeholder="Specify conditions..."
        />
      )}

      <Text style={styles.sectionTitle}>Medications</Text>
      <OptionPicker
        options={MEDICATION_OPTIONS}
        value={medications}
        onChange={setMedications}
        multiple
        showNone
        showOther
        otherSelected={showMedOther}
        onOtherToggle={setShowMedOther}
        onNone={() => {
          setMedications([]);
          setShowMedOther(false);
          setMedicationsOther('');
        }}
      />
      {showMedOther && (
        <FormInput
          label="Other Medications"
          value={medicationsOther}
          onChangeText={setMedicationsOther}
          placeholder="Specify medications..."
        />
      )}

      <Text style={styles.sectionTitle}>Injuries</Text>
      <OptionPicker
        options={INJURY_OPTIONS}
        value={injuries}
        onChange={setInjuries}
        multiple
        showNone
        showOther
        otherSelected={showInjuriesOther}
        onOtherToggle={setShowInjuriesOther}
        onNone={() => {
          setInjuries([]);
          setShowInjuriesOther(false);
          setInjuriesOther('');
        }}
      />
      {showInjuriesOther && (
        <FormInput
          label="Other Injuries"
          value={injuriesOther}
          onChangeText={setInjuriesOther}
          placeholder="Specify injuries..."
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
          title={loading ? 'Finishing...' : 'Complete Onboarding'}
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
  intro: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.mineShaft,
    marginTop: spacing.sm,
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

export default HealthInfoStep;
