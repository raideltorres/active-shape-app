import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SectionCard from './SectionCard';
import { colors, spacing, typography } from '../../../theme';

/**
 * Nutrition Plan section for Plan screen
 */
const NutritionPlanSection = ({ nutritionPlan, mealTiming }) => {
  const daily = nutritionPlan?.daily || nutritionPlan || {};

  return (
    <SectionCard title="Nutrition Plan" icon="nutrition-outline" color={colors.mainOrange}>
      <View style={styles.macrosGrid}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{daily.protein || '--'}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{daily.carbs || '--'}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{daily.fats || '--'}g</Text>
          <Text style={styles.macroLabel}>Fats</Text>
        </View>
      </View>

      {mealTiming && mealTiming.length > 0 && (
        <View style={styles.mealTiming}>
          <Text style={styles.mealTimingTitle}>Meal Schedule</Text>
          {mealTiming.map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <Text style={styles.mealTime}>{meal.time}</Text>
              <Text style={styles.mealName}>{meal.meal}</Text>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...typography.h3,
    color: colors.mainOrange,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 4,
  },
  mealTiming: {
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  mealTimingTitle: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  mealTime: {
    ...typography.caption,
    color: colors.mainOrange,
    width: 80,
    fontWeight: '600',
  },
  mealName: {
    ...typography.bodySmall,
    color: colors.mineShaft,
  },
});

export default NutritionPlanSection;
