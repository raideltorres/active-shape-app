import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

/**
 * Reusable form input with icon and optional password toggle
 */
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  editable,
  containerStyle,
  maxLength,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, editable === false && styles.inputContainerDisabled]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={editable === false ? colors.alto : colors.raven}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, editable === false && styles.inputDisabled]}
          placeholder={placeholder}
          placeholderTextColor={colors.alto}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          maxLength={maxLength}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onTogglePassword} style={styles.eyeButton}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.raven}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  inputContainerDisabled: {
    backgroundColor: colors.concrete,
    borderColor: colors.mercury,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.codGray,
  },
  inputDisabled: {
    color: colors.raven,
  },
  eyeButton: {
    padding: spacing.xs,
  },
});

export default FormInput;
