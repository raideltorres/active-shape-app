import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../theme';

/**
 * Reusable ribbon label (matches web Ribbon: top-right overlap, fold triangle).
 * Parent must have position: 'relative'.
 *
 * @param {React.ReactNode} children - Label text (e.g. "Calories", "Fibers")
 * @param {number} top - Distance from top (default 8, match web)
 * @param {number} right - Distance from right; negative = overlap (default -8, match web)
 * @param {Object} style - Optional style for the wrapper
 */
const Ribbon = ({ children, top = 8, right = -8, style }) => (
  <View style={[styles.wrap, { top, right }, style]}>
    <View style={styles.tag}>
      <Text style={styles.tagText}>{children}</Text>
      <View style={styles.foldClip}>
        <View style={styles.foldTriangle} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 1,
  },
  tag: {
    backgroundColor: colors.mainOrange,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.redBerry,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tagText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  foldClip: {
    position: 'absolute',
    bottom: -7,
    right: 0,
    width: 7,
    height: 7,
    overflow: 'hidden',
  },
  foldTriangle: {
    position: 'absolute',
    left: -5,
    top: -4,
    width: 10,
    height: 10,
    backgroundColor: colors.redBerry,
    transform: [{ rotate: '45deg' }],
  },
});

export default Ribbon;
