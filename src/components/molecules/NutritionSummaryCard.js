import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from './Card';
import { colors, spacing, typography } from '../../theme';

/**
 * Card showing today's nutrition summary
 */
const NutritionSummaryCard = ({ nutrition = {}, goals = {} }) => {
  const { calories = 0, proteins = 0, carbs = 0, fats = 0 } = nutrition;
  const calorieGoal = goals?.dailyCalories || 2000;

  const calorieProgress = Math.min((calories / calorieGoal) * 100, 100);

  const macros = [
    { label: 'Protein', value: proteins, unit: 'g', color: colors.mainOrange },
    { label: 'Carbs', value: carbs, unit: 'g', color: colors.havelockBlue },
    { label: 'Fat', value: fats, unit: 'g', color: colors.lima },
  ];

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={20} color={colors.mainOrange} />
        </View>
        <Text style={styles.title}>Today's Nutrition</Text>
      </View>

      {/* Calories Progress */}
      <View style={styles.caloriesSection}>
        <View style={styles.caloriesHeader}>
          <Text style={styles.caloriesValue}>{calories}</Text>
          <Text style={styles.caloriesGoal}>/ {calorieGoal} kcal</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${calorieProgress}%` }]} />
        </View>
      </View>

      {/* Macros */}
      <View style={styles.macrosGrid}>
        {macros.map((macro) => (
          <View key={macro.label} style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
            <Text style={styles.macroValue}>
              {macro.value}
              <Text style={styles.macroUnit}>{macro.unit}</Text>
            </Text>
            <Text style={styles.macroLabel}>{macro.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.alabaster,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
  },
  caloriesSection: {
    marginBottom: spacing.lg,
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  caloriesValue: {
    ...typography.h2,
    color: colors.mainOrange,
  },
  caloriesGoal: {
    ...typography.body,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gallery,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.mainOrange,
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  macroValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  macroUnit: {
    ...typography.caption,
    color: colors.raven,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});

export default NutritionSummaryCard;
