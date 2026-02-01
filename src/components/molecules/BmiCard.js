import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const BMI_CATEGORIES = [
  { label: 'Underweight', maxBmi: 18.5, color: colors.havelockBlue },
  { label: 'Normal', maxBmi: 25, color: colors.lima },
  { label: 'Overweight', maxBmi: 30, color: colors.mainOrange },
  { label: 'Obese', maxBmi: Infinity, color: colors.cinnabar },
];

const calculateBmi = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

const getBmiCategory = (bmi) => {
  if (!bmi) return null;
  return BMI_CATEGORIES.find(cat => bmi < cat.maxBmi) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
};

const getBmiDescription = (category, descriptionVariant = 'motivational') => {
  if (!category) return 'Complete your profile to see personalized recommendations.';
  
  if (descriptionVariant === 'motivational') {
    switch (category.label) {
      case 'Underweight':
        return 'Consider increasing your caloric intake with nutritious foods. You\'ve got this!';
      case 'Normal':
        return 'Great job! You\'re in a healthy range. Keep maintaining your lifestyle!';
      case 'Overweight':
        return 'Small changes can make a big difference. Every step counts on your journey!';
      case 'Obese':
        return 'Focus on gradual, sustainable changes. Your health journey starts with one step!';
      default:
        return 'Keep tracking your progress!';
    }
  }

  // Clinical descriptions
  switch (category.label) {
    case 'Underweight':
      return 'BMI below 18.5 is classified as underweight.';
    case 'Normal':
      return 'BMI between 18.5 and 24.9 is classified as normal weight.';
    case 'Overweight':
      return 'BMI between 25 and 29.9 is classified as overweight.';
    case 'Obese':
      return 'BMI of 30 or above is classified as obese.';
    default:
      return '';
  }
};

const BmiCard = ({ weight, height, bodyComposition }) => {
  const bmi = useMemo(() => calculateBmi(weight, height), [weight, height]);
  const category = useMemo(() => getBmiCategory(bmi), [bmi]);
  const description = useMemo(() => getBmiDescription(category), [category]);

  // Calculate gauge position (BMI 15-40 range mapped to 0-100%)
  const gaugePosition = useMemo(() => {
    if (!bmi) return 50;
    const minBmi = 15;
    const maxBmi = 40;
    return Math.min(Math.max(((bmi - minBmi) / (maxBmi - minBmi)) * 100, 0), 100);
  }, [bmi]);

  // Empty state
  if (!weight || !height) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="body-outline" size={32} color={colors.raven} />
          <Text style={styles.emptyTitle}>BMI Calculator</Text>
          <Text style={styles.emptyDescription}>
            Add your weight and height in your profile to calculate your BMI
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${category?.color || colors.raven}15` }]}>
          <Ionicons name="body-outline" size={20} color={category?.color || colors.raven} />
        </View>
        <Text style={styles.title}>BMI</Text>
      </View>

      {/* BMI Value */}
      <View style={styles.bmiValueContainer}>
        <Text style={[styles.bmiValue, { color: category?.color || colors.mineShaft }]}>
          {bmi?.toFixed(1) || '--'}
        </Text>
        {category && (
          <View style={[styles.categoryBadge, { backgroundColor: `${category.color}15` }]}>
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>
        )}
      </View>

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeTrack}>
          {BMI_CATEGORIES.map((cat, index) => {
            const categoryRanges = [
              { start: 0, end: 14 },
              { start: 14, end: 40 },
              { start: 40, end: 60 },
              { start: 60, end: 100 },
            ];
            const range = categoryRanges[index];
            
            return (
              <View
                key={index}
                style={[
                  styles.gaugeSegment,
                  {
                    backgroundColor: cat.color,
                    flex: range.end - range.start,
                  },
                  index === 0 && styles.gaugeSegmentFirst,
                  index === BMI_CATEGORIES.length - 1 && styles.gaugeSegmentLast,
                ]}
              />
            );
          })}
        </View>
        <View style={[styles.gaugeIndicator, { left: `${gaugePosition}%` }]}>
          <View style={[styles.gaugeIndicatorDot, { backgroundColor: category?.color || colors.raven }]} />
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.labelText}>15</Text>
        <Text style={styles.labelText}>25</Text>
        <Text style={styles.labelText}>35</Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.raven} />
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      {/* Body composition if available */}
      {bodyComposition && (
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  bmiValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    marginRight: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  gaugeContainer: {
    position: 'relative',
    height: 24,
    marginBottom: spacing.xs,
  },
  gaugeTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  gaugeSegment: {
    height: '100%',
  },
  gaugeSegmentFirst: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  gaugeSegmentLast: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  gaugeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 24,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeIndicatorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  labelText: {
    ...typography.caption,
    color: colors.raven,
    fontSize: 10,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
  },
});

export default BmiCard;
