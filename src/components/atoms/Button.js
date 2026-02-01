import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { colors, spacing, borderRadius, typography } from '../../theme';

const Button = ({ title, onPress, variant = 'primary', disabled = false, style }) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'secondary' && styles.textSecondary,
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.alto,
  },
  buttonDisabled: {
    backgroundColor: colors.alto,
  },
  text: {
    ...typography.button,
  },
  textSecondary: {
    color: colors.codGray,
  },
  textDisabled: {
    color: colors.raven,
  },
});

export default Button;

