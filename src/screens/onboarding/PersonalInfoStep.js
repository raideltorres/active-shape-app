import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import FormInput from '../../components/atoms/FormInput';
import Button from '../../components/atoms/Button';
import GenderPicker from '../../components/organisms/GenderPicker';
import DateOfBirthPicker from '../../components/molecules/DateOfBirthPicker';
import { colors, spacing, typography } from '../../theme';

const PersonalInfoStep = ({ onSubmit, profileData, loading }) => {
  const [name, setName] = useState(profileData?.name || '');
  const [gender, setGender] = useState(profileData?.gender || '');
  const [birthDate, setBirthDate] = useState(
    profileData?.birthDate ? new Date(profileData.birthDate) : null,
  );
  const [email, setEmail] = useState(profileData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = useCallback(() => {
    if (!name.trim()) return 'Please enter your name';
    if (!gender) return 'Please select your gender';
    if (!birthDate) return 'Please select your date of birth';

    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
    if (age < 13) return 'You must be at least 13 years old';

    if (!email.trim()) return 'Please enter your email';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    if (!password) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }, [name, gender, birthDate, email, password, confirmPassword]);

  const handleSubmit = useCallback(() => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    const data = {
      name: name.trim(),
      gender,
      birthDate: birthDate.toISOString(),
      email: email.trim(),
      password,
      onboarding: {
        ...(profileData?.onboarding || {}),
        onboardingStep: 2,
      },
    };

    onSubmit(data);
  }, [validate, name, gender, birthDate, email, password, profileData, onSubmit]);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <FormInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          icon="person-outline"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Gender</Text>
        <GenderPicker
          value={gender}
          onChange={setGender}
          question="Select your biological gender to help us provide more accurate health and calorie calculations. If you prefer not to specify, we'll use a generic formula."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Date of Birth</Text>
        <Text style={styles.sectionHint}>
          Your age helps us calculate accurate calorie needs and provide
          personalized health recommendations.
        </Text>
        <DateOfBirthPicker
          value={birthDate}
          onChange={setBirthDate}
        />
      </View>

      <View style={styles.section}>
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          editable={!profileData?.email}
        />
      </View>

      <View style={styles.section}>
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          secureTextEntry
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoComplete="password-new"
          icon="lock-closed-outline"
        />
      </View>

      <View style={styles.section}>
        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Retype your password"
          secureTextEntry
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="password-new"
          icon="lock-closed-outline"
        />
      </View>

      <Button
        title={loading ? 'Saving...' : 'NEXT'}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.h4,
    color: colors.codGray,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: spacing.xxl,
  },
});

export default PersonalInfoStep;
