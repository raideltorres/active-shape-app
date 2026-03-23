import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../molecules';
import { Button } from '../../atoms';
import { colors, spacing, typography } from '../../../theme';

/**
 * Displays AI food analysis: detected foods, total nutrition, optional suggestions.
 * Matches web FoodAnalysisResult data shape: { foods, totalNutrition, suggestions, mealType }.
 */
const FoodAnalysisResultCard = ({ analysis, onLogToTracking, onAnalyzeAnother, logging }) => {
  if (!analysis) return null;

  const { foods = [], totalNutrition = {}, suggestions = [], mealType } = analysis;

  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="nutrition-outline" size={24} color={colors.mainOrange} />
        <Text style={styles.title}>Food analysis results</Text>
        {mealType ? (
          <View style={[styles.mealTag, mealType === 'breakfast' && styles.mealTagBreakfast, mealType === 'lunch' && styles.mealTagLunch]}>
            <Text style={styles.mealTagText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.notice}>
        Our AI does its best to identify ingredients. Review the results and adjust your tracking if needed.
      </Text>

      {foods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected foods</Text>
          {foods.map((food, index) => (
            <View key={index} style={styles.foodRow}>
              <View style={styles.foodTop}>
                <Text style={styles.foodName}>{food.name}</Text>
                {food.portion ? <Text style={styles.foodPortion}>{food.portion}</Text> : null}
              </View>
              {food.nutrition && (() => {
                const p = food.nutrition.proteins || 0;
                const c = food.nutrition.carbs || 0;
                const f = food.nutrition.fats || 0;
                const total = p + c + f;
                const pPct = total > 0 ? (p / total) * 100 : 0;
                const cPct = total > 0 ? (c / total) * 100 : 0;
                const fPct = total > 0 ? (f / total) * 100 : 0;
                const r1 = (v) => Math.round(v * 10) / 10;
                return (
                  <View style={styles.foodMacros}>
                    <View style={styles.foodMacroBar}>
                      <View style={[styles.foodMacroFill, styles.fillProtein, { width: `${pPct}%` }]} />
                      <View style={[styles.foodMacroFill, styles.fillCarbs, { width: `${cPct}%` }]} />
                      <View style={[styles.foodMacroFill, styles.fillFats, { width: `${fPct}%` }]} />
                    </View>
                    <View style={styles.foodMacroLegend}>
                      <Text style={[styles.foodMacroVal, styles.valProtein]}>{r1(p)}g prot</Text>
                      <Text style={[styles.foodMacroVal, styles.valCarbs]}>{r1(c)}g carbs</Text>
                      <Text style={[styles.foodMacroVal, styles.valFats]}>{r1(f)}g fats</Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Total nutrition</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionCard}>
            <Ionicons name="flame-outline" size={22} color={colors.mainOrange} />
            <View>
              <Text style={styles.nutritionValue}>{totalNutrition.calories ?? 0}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
          </View>
          <View style={styles.nutritionCard}>
            <Ionicons name="fish-outline" size={22} color={colors.mariner} />
            <View>
              <Text style={styles.nutritionValue}>{totalNutrition.proteins ?? 0}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
          </View>
          <View style={styles.nutritionCard}>
            <Ionicons name="restaurant-outline" size={22} color={colors.fernFrond} />
            <View>
              <Text style={styles.nutritionValue}>{totalNutrition.carbs ?? 0}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
          </View>
          <View style={styles.nutritionCard}>
            <Ionicons name="water-outline" size={22} color={colors.buttercup} />
            <View>
              <Text style={styles.nutritionValue}>{totalNutrition.fats ?? 0}g</Text>
              <Text style={styles.nutritionLabel}>Fats</Text>
            </View>
          </View>
        </View>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI recommendations</Text>
          {suggestions.map((s, i) => (
            <Text key={i} style={styles.suggestion}>{s}</Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Log to tracking"
          onPress={onLogToTracking}
          disabled={logging}
          icon="checkmark-circle-outline"
          style={styles.logBtn}
        />
        <Button
          title="Analyze another meal"
          onPress={onAnalyzeAnother}
          variant="secondary"
          icon="camera-outline"
          style={styles.anotherBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
    marginLeft: spacing.sm,
    flex: 1,
  },
  mealTag: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mealTagBreakfast: { backgroundColor: colors.buttercup },
  mealTagLunch: { backgroundColor: colors.mariner },
  mealTagText: {
    ...typography.bodySmall,
    color: colors.white,
  },
  notice: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  foodRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  foodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: { ...typography.body, color: colors.mineShaft, fontWeight: '500' },
  foodPortion: { ...typography.bodySmall, color: colors.raven },
  foodMacros: {
    marginTop: 8,
  },
  foodMacroBar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gallery,
    overflow: 'hidden',
    marginBottom: 5,
  },
  foodMacroFill: {
    height: 5,
  },
  fillProtein: {
    backgroundColor: colors.mariner,
  },
  fillCarbs: {
    backgroundColor: colors.buttercup,
  },
  fillFats: {
    backgroundColor: colors.cinnabar,
  },
  foodMacroLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  foodMacroVal: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '500',
  },
  valProtein: {
    color: colors.mariner,
  },
  valCarbs: {
    color: colors.buttercup,
  },
  valFats: {
    color: colors.cinnabar,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nutritionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.athensGray,
    padding: spacing.md,
    borderRadius: 8,
    minWidth: '47%',
  },
  nutritionValue: { ...typography.h4, color: colors.mineShaft },
  nutritionLabel: { ...typography.bodySmall, color: colors.raven },
  suggestion: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: 4,
  },
  actions: { marginTop: spacing.md },
  logBtn: { marginBottom: spacing.sm },
  anotherBtn: {},
});

export default FoodAnalysisResultCard;
