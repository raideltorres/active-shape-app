import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
import { getBmiCategoryColor } from '../../utils/measure';
import BmiGauge from './BmiGauge/BmiGauge';

/**
 * BmiCard component
 * 
 * Props:
 * - bmiData: Object from backend containing { raw, adjusted, category, calculatedAt }
 * - bodyComposition: Object with { type, bodyFat, muscleMass }
 */
const BmiCard = ({ bmiData, bodyComposition }) => {
  const displayBmi = bmiData?.adjusted;
  const category = bmiData?.category;
  const categoryColor = category ? getBmiCategoryColor(category) : colors.raven;
  const message = bmiData?.message;

  // Show raw vs adjusted if there's a meaningful difference
  const showAdjustmentNote = bmiData?.raw && bmiData?.adjusted && 
    Math.abs(bmiData.raw - bmiData.adjusted) > 0.1;

  // Empty state
  if (!displayBmi) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="body-outline"
          iconSize={32}
          iconColor={colors.raven}
          title="BMI Calculator"
          description="Add your weight and height in your profile to calculate your BMI"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Ionicons name="body-outline" size={20} color={categoryColor} />
          </View>
          <Text style={styles.title}>BMI</Text>
        </View>
        <View style={[styles.bmiValueBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.bmiValueText, { color: categoryColor }]}>
            {displayBmi?.toFixed(1) || '--'}
          </Text>
        </View>
      </View>

      {/* Show adjustment note if BMI was adjusted for body composition */}
      {showAdjustmentNote && (
        <View style={styles.adjustmentNote}>
          <Ionicons name="fitness-outline" size={12} color={colors.raven} />
          <Text style={styles.adjustmentNoteText}>
            Adjusted for body composition (raw: {bmiData.raw?.toFixed(1)})
          </Text>
        </View>
      )}

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <BmiGauge bmi={displayBmi} />
      </View>

      {/* Category Label */}
      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>{category}</Text>
        </View>
      )}

      {/* Message */}
      {message && (
        <View style={styles.descriptionContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.raven} />
          <Text style={styles.descriptionText}>{message}</Text>
        </View>
      )}

      {/* Body composition if available */}
      {bodyComposition && (bodyComposition.bodyFat || bodyComposition.muscleMass) && (
        <View style={styles.bodyCompRow}>
          {bodyComposition.bodyFat && (
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Body Fat</Text>
              <Text style={styles.bodyCompValue}>{bodyComposition.bodyFat}%</Text>
            </View>
          )}
          {bodyComposition.muscleMass && (
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Muscle Mass</Text>
              <Text style={styles.bodyCompValue}>{bodyComposition.muscleMass}%</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  bmiValueBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  bmiValueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  adjustmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  adjustmentNoteText: {
    ...typography.caption,
    color: colors.raven,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  categoryText: {
    ...typography.body,
    fontWeight: '600',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  descriptionText: {
    ...typography.caption,
    color: colors.raven,
    flex: 1,
    marginLeft: spacing.xs,
    lineHeight: 18,
  },
  bodyCompRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  bodyCompItem: {
    flex: 1,
    alignItems: 'center',
  },
  bodyCompLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  bodyCompValue: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: 4,
  },
});

export default BmiCard;
