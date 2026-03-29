import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing } from '../../theme';

const TimeSeparator = () => (
  <View style={styles.separatorContainer}>
    <Text style={styles.separator}>:</Text>
  </View>
);

const styles = StyleSheet.create({
  separatorContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  separator: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.mineShaft,
  },
});

export default TimeSeparator;
