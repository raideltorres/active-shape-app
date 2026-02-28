import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import { colors, spacing, typography, borderRadius } from '../../theme';

/**
 * Single-thumb slider with labeled step descriptions.
 * Used for lifestyle habit questions (activity level, exercise frequency, etc.).
 *
 * @param {string} title
 * @param {number} value - current index
 * @param {(v: number) => void} onChange
 * @param {string[]} labels - ordered labels for each step
 */
const LabeledSlider = ({ title, value = 0, onChange, labels = [] }) => {
  const [sliderLength, setSliderLength] = useState(260);
  const max = Math.max(labels.length - 1, 1);

  const handleChange = useCallback(
    (values) => {
      onChange?.(values[0]);
    },
    [onChange],
  );

  const currentLabel = labels[value] || '';

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.labelBox}>
        <Text style={styles.labelText}>{currentLabel}</Text>
      </View>
      <View
        style={styles.sliderRow}
        onLayout={(e) => setSliderLength(e.nativeEvent.layout.width - 20)}
      >
        <MultiSlider
          values={[value]}
          min={0}
          max={max}
          step={1}
          sliderLength={Math.max(100, sliderLength)}
          onValuesChangeFinish={handleChange}
          selectedStyle={styles.selectedTrack}
          unselectedStyle={styles.unselectedTrack}
          markerStyle={styles.thumb}
          touchDimensions={{ height: 40, width: 40, borderRadius: 20 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h4,
    color: colors.mainBlue,
    marginBottom: spacing.sm,
  },
  labelBox: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  labelText: {
    ...typography.body,
    color: colors.mineShaft,
    textAlign: 'center',
  },
  sliderRow: {
    paddingHorizontal: 10,
  },
  selectedTrack: {
    backgroundColor: colors.mainOrange,
  },
  unselectedTrack: {
    backgroundColor: colors.gallery,
  },
  thumb: {
    backgroundColor: colors.mainOrange,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});

export default LabeledSlider;
