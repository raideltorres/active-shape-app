import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../theme';

/**
 * Horizontal divider with optional centered text
 */
const Divider = ({ text }) => {
  if (!text) {
    return <View style={styles.line} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gallery,
  },
  text: {
    ...typography.caption,
    color: colors.raven,
    paddingHorizontal: spacing.md,
  },
});

export default Divider;
