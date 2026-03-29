import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nutritionPerServing: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  nutritionList: {
    gap: spacing.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  nutritionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nutritionValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.mineShaft,
    flex: 1,
  },
  nutritionLabel: {
    ...typography.body,
    color: colors.raven,
  },
});

const NutritionRow = ({ icon, value, label }) => (
  <View style={styles.nutritionRow}>
    <View style={styles.nutritionIcon}>
      <Ionicons name={icon} size={20} color={colors.mainOrange} />
    </View>
    <Text style={styles.nutritionValue}>{value}</Text>
    <Text style={styles.nutritionLabel}>{label}</Text>
  </View>
);

const RecipeNutritionFacts = ({ nutrition }) => {
  if (!nutrition || !(nutrition.calories || nutrition.protein || nutrition.netCarbs || nutrition.fat)) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.nutritionHeader}>
        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        <Text style={styles.nutritionPerServing}>Per serving</Text>
      </View>
      <View style={styles.nutritionList}>
        {nutrition.calories && (
          <NutritionRow icon="flame-outline" value={`${nutrition.calories.amount} kcal`} label="Calories" />
        )}
        {nutrition.protein && (
          <NutritionRow
            icon="nutrition-outline"
            value={`${nutrition.protein.amount}${nutrition.protein.unit}`}
            label="Protein"
          />
        )}
        {nutrition.netCarbs && (
          <NutritionRow
            icon="leaf-outline"
            value={`${nutrition.netCarbs.amount}${nutrition.netCarbs.unit}`}
            label="Net Carbs"
          />
        )}
        {nutrition.fat && (
          <NutritionRow icon="water-outline" value={`${nutrition.fat.amount}${nutrition.fat.unit}`} label="Fat" />
        )}
        {nutrition.fiber && (
          <NutritionRow icon="git-branch-outline" value={`${nutrition.fiber.amount}${nutrition.fiber.unit}`} label="Fiber" />
        )}
        {nutrition.sugar && (
          <NutritionRow icon="flame-outline" value={`${nutrition.sugar.amount}${nutrition.sugar.unit}`} label="Sugar" />
        )}
      </View>
    </View>
  );
};

export default RecipeNutritionFacts;
