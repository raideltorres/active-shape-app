import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

import { GenderPicker, DateOfBirthPicker } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { colors, spacing, typography } from '../../../theme';

const PersonalInfoStep = ({ onSubmit, profileData, loading }) => {
  const [gender, setGender] = useState(profileData?.gender || '');
  const [birthDate, setBirthDate] = useState(profileData?.birthDate || '');

  const handleSubmit = () => {
    if (!gender) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select your gender.' });
      return;
    }
    if (!birthDate) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please select your date of birth.' });
      return;
    }

    onSubmit({
      gender,
      birthDate,
      onboarding: {
        ...profileData?.onboarding,
        onboardingStep: 2,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gender</Text>
        <GenderPicker value={gender} onChange={setGender} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date of Birth</Text>
        <DateOfBirthPicker value={birthDate} onChange={setBirthDate} />
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
    marginTop: spacing.xl,
  },
});

export default PersonalInfoStep;
