import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography, borderRadius } from '../../theme';

const formatTimeDigit = (value) => value.toString().padStart(2, '0');

const TimeDigit = ({ value, label }) => (
  <View style={styles.digitContainer}>
    <View style={styles.digitBox}>
      <Text style={styles.digitText}>{formatTimeDigit(value)}</Text>
    </View>
    <Text style={styles.digitLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  digitContainer: {
    alignItems: 'center',
  },
  digitBox: {
    flexDirection: 'row',
  },
  digitText: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.mainOrange,
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
    minWidth: 48,
    textAlign: 'center',
    overflow: 'hidden',
  },
  digitLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
  },
});

export default TimeDigit;
