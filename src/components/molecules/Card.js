import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors, spacing, borderRadius } from '../../theme';

/**
 * Reusable card component with shadow and rounded corners
 */
const Card = ({ children, style, variant = 'default' }) => {
  const variantStyles = {
    default: styles.default,
    elevated: styles.elevated,
    outlined: styles.outlined,
    gradient: styles.gradient,
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  default: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.gallery,
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    backgroundColor: colors.mainOrange,
  },
});

export default Card;
