import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import BmiGauge from '../BmiGauge/BmiGauge';
import { colors, spacing, typography } from '../../../theme';
import {
  calculateBmi,
  adjustBmiForBodyComposition,
  determineBmiRange,
  determineBmiMotivationalMessage,
  getBmiCategoryColor,
} from '../../../utils/measure';

/**
 * BmiGaugeWithLabels — composite component matching the web version.
 *
 * Supports two modes:
 * 1. Backend data mode: pass `bmiData` from user profile
 * 2. Preview mode: pass `weight`, `height`, `bodyComposition` for live preview (onboarding)
 */
const BmiGaugeWithLabels = ({
  bmiData,
  weight,
  height,
  bodyComposition = 'average',
  showDescription = true,
}) => {
  const displayData = useMemo(() => {
    if (bmiData) {
      return {
        bmi: bmiData.adjusted,
        category: bmiData.category,
        description: bmiData.message,
      };
    }

    if (weight && height) {
      const rawBmi = calculateBmi(weight, height);
      const adjustedBmi = adjustBmiForBodyComposition(rawBmi, bodyComposition);
      const category = determineBmiRange(adjustedBmi);
      const message = determineBmiMotivationalMessage(adjustedBmi);

      return { bmi: adjustedBmi, category, description: message };
    }

    return null;
  }, [bmiData, weight, height, bodyComposition]);

  if (!displayData) return null;

  const { bmi, category, description } = displayData;

  const categoryColor = useMemo(() => getBmiCategoryColor(bmi), [bmi]);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrap}>
        <BmiGauge bmi={bmi} />
      </View>

      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}18` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>{category}</Text>
        </View>
      )}

      {showDescription && description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  gaugeWrap: {
    alignItems: 'center',
    width: '100%',
  },
  categoryBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});

export default BmiGaugeWithLabels;
