import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';

const TOAST_VARIANTS = {
  success: {
    icon: 'checkmark-circle',
    accentColor: colors.lima,
    bgColor: `${colors.lima}12`,
  },
  error: {
    icon: 'alert-circle',
    accentColor: colors.error || '#E53E3E',
    bgColor: '#FEE2E2',
  },
  info: {
    icon: 'information-circle',
    accentColor: colors.mainBlue,
    bgColor: `${colors.mainBlue}12`,
  },
};

const ToastContent = ({ type, text1, text2 }) => {
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info;

  return (
    <View style={[styles.container, { borderLeftColor: variant.accentColor }]}>
      <Ionicons name={variant.icon} size={22} color={variant.accentColor} style={styles.icon} />
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title} numberOfLines={1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.message} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props) => <ToastContent type="success" {...props} />,
  error: (props) => <ToastContent type="error" {...props} />,
  info: (props) => <ToastContent type="info" {...props} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  message: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});
