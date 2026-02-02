import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../../theme';

/**
 * Reusable Button component
 * 
 * @param {string} title - Button text
 * @param {Function} onPress - Press handler
 * @param {'primary' | 'secondary' | 'ghost'} variant - Button style variant
 * @param {boolean} disabled - Disabled state
 * @param {string} icon - Ionicons icon name (optional)
 * @param {'left' | 'right'} iconPosition - Icon position (default: left)
 * @param {string} color - Custom color for ghost variant
 * @param {Object} style - Additional button styles
 */
const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  icon,
  iconPosition = 'left',
  color,
  style,
}) => {
  const isGhost = variant === 'ghost';
  const buttonColor = color || colors.mainOrange;

  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    isGhost && [styles.buttonGhost, { backgroundColor: `${buttonColor}10` }],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'secondary' && styles.textSecondary,
    isGhost && [styles.textGhost, { color: buttonColor }],
    disabled && styles.textDisabled,
  ];

  const iconColor = isGhost 
    ? buttonColor 
    : variant === 'secondary' 
      ? colors.codGray 
      : colors.white;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={18} color={iconColor} style={styles.iconLeft} />
        )}
        <Text style={textStyle}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={18} color={iconColor} style={styles.iconRight} />
        )}
      </View>
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
  buttonGhost: {
    height: 'auto',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.alto,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
  },
  textSecondary: {
    color: colors.codGray,
  },
  textGhost: {
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.raven,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});

export default Button;
