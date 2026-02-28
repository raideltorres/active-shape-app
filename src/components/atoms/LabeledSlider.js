import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { colors, spacing, typography, borderRadius } from '../../theme';

const TRACK_HEIGHT = 44;

const LabeledSlider = ({
  title,
  subtitle,
  animation,
  value = 0,
  onChange,
  labels = [],
}) => {
  const max = Math.max(labels.length - 1, 1);
  const segmentCount = Math.max(labels.length - 1, 1);
  const currentLabel = labels[value] || '';

  const decrement = useCallback(() => {
    onChange?.(Math.max(0, value - 1));
  }, [value, onChange]);

  const increment = useCallback(() => {
    onChange?.(Math.min(max, value + 1));
  }, [value, max, onChange]);

  const handleSegmentPress = useCallback(
    (segmentIndex) => {
      const newValue = segmentIndex + 1;
      onChange?.(Math.min(newValue, max));
    },
    [onChange, max],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {animation && (
          <View style={styles.lottieWrap}>
            <LottieView source={animation} autoPlay loop style={styles.lottie} speed={1.2} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.button} onPress={decrement} activeOpacity={0.7}>
          <Ionicons name="remove" size={18} color={colors.mineShaft} />
        </TouchableOpacity>

        <View style={styles.trackWrap}>
          {Array.from({ length: segmentCount }, (_, i) => (
            <Pressable
              key={i}
              style={[
                styles.segment,
                i < value && styles.segmentFilled,
                i === 0 && styles.segmentFirst,
                i === segmentCount - 1 && styles.segmentLast,
              ]}
              onPress={() => handleSegmentPress(i)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={increment} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color={colors.mineShaft} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{currentLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lottieWrap: {
    width: 48,
    height: 48,
  },
  lottie: {
    width: 48,
    height: 48,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.mainBlue,
  },
  subtitle: {
    fontSize: 11,
    color: colors.raven,
    marginTop: 1,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.alto,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  trackWrap: {
    flex: 1,
    flexDirection: 'row',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    backgroundColor: colors.alto,
    borderRightWidth: 1,
    borderRightColor: colors.mainBlue,
  },
  segmentFilled: {
    backgroundColor: `${colors.mainOrange}CC`,
  },
  segmentFirst: {
    borderTopLeftRadius: TRACK_HEIGHT / 2,
    borderBottomLeftRadius: TRACK_HEIGHT / 2,
  },
  segmentLast: {
    borderTopRightRadius: TRACK_HEIGHT / 2,
    borderBottomRightRadius: TRACK_HEIGHT / 2,
    borderRightWidth: 0,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mainOrange,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

export default LabeledSlider;
