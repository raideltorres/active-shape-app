import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useGetProfileQuery, useUpsertUserMutation } from '../../store/api';
import { Button } from '../../components/atoms';
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { validatePassword } from '../../utils/validation';
import { colors, spacing, typography, borderRadius } from '../../theme';

const validate = (password, confirmPassword) => {
  const errors = {};
  const passwordError = validatePassword(password);
  if (!password) {
    errors.password = 'Please enter your new password';
  } else if (passwordError) {
    errors.password = passwordError;
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'The two passwords do not match';
  }
  return errors;
};

const ChangePasswordScreen = ({ navigation }) => {
  const { data: profile } = useGetProfileQuery();
  const [upsertUser, { isLoading }] = useUpsertUserMutation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(password, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await upsertUser({ id: profile._id, password }).unwrap();
      Toast.show({ type: 'success', text1: 'Password Updated', text2: 'Your password has been changed successfully.' });
      navigation.goBack();
    } catch (e) {
      if (__DEV__) console.error('Change password error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: e?.data?.message || 'Failed to update password. Please try again.' });
    }
  }, [password, confirmPassword, profile?._id, upsertUser, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Change Password" />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.mainBlue} />
        </View>
        <Text style={styles.subtitle}>
          Enter a new password for your account. It must be at least 8 characters with an uppercase letter, a number, and a special character.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={[styles.inputWrap, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.raven} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((prev) => ({ ...prev, password: undefined })); }}
              placeholder="Enter new password"
              placeholderTextColor={colors.alto}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.raven} />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrap, errors.confirmPassword && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.raven} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((prev) => ({ ...prev, confirmPassword: undefined })); }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.alto}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.raven} />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <Button
          title={isLoading ? 'Updating...' : 'Update Password'}
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.mainBlue}12`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.mineShaft,
    height: 48,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default ChangePasswordScreen;
