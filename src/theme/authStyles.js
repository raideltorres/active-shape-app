import { StyleSheet } from 'react-native';

import { colors, spacing, typography, borderRadius } from './index';

/**
 * Shared styles for auth screens (Login, Register)
 * Layout styles (container, keyboardView, scrollContent) are in ScrollableFormLayout template
 */
export const authStyles = StyleSheet.create({
  // Header section
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
  },

  // Social buttons section
  socialSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  // Form sections
  form: {
    gap: spacing.lg,
  },
  formCompact: {
    gap: spacing.md,
  },

  // Footer navigation
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.raven,
  },
  footerLink: {
    ...typography.body,
    color: colors.mainOrange,
    fontWeight: '600',
  },

  // Forgot password link
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.mainOrange,
    fontWeight: '600',
  },

  // Terms and conditions
  termsText: {
    ...typography.caption,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  termsLink: {
    color: colors.mainOrange,
    fontWeight: '600',
  },

  // Dev mode button (only visible in __DEV__)
  devButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFF3CD',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFC107',
    alignItems: 'center',
  },
  devButtonText: {
    ...typography.bodySmall,
    color: '#856404',
    fontWeight: '600',
  },
});
