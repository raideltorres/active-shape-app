import { StyleSheet } from 'react-native';

import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.codGray,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.codGray,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.codGray,
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.codGray,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.mineShaft,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.raven,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.raven,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mineShaft,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 20,
  },
});

