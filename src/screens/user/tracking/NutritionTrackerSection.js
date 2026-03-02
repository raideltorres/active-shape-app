import React, { useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { Card, MealLogCard } from '../../../components/molecules';
import { AiFoodScanner } from '../../../components/organisms/AiFoodScanner';
import { Button } from '../../../components/atoms';
import { useGetDailySummaryQuery, useDeleteMealMutation } from '../../../store/api';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const NutritionTrackerSection = ({
  userId,
  selectedDate,
  onFoodAnalyzed,
  caloriesConsumed,
  caloriesBurned,
  proteins,
  carbs,
  fats,
  onCaloriesConsumedChange,
  onCaloriesBurnedChange,
  onProteinsChange,
  onCarbsChange,
  onFatsChange,
  onNutritionSave,
  onMacrosSave,
  saving,
}) => {
  const { data: dailySummary } = useGetDailySummaryQuery(selectedDate, { skip: !selectedDate });
  const [deleteMeal] = useDeleteMealMutation();

  const meals = dailySummary?.meals || [];

  const handleDeleteMeal = useCallback((meal) => {
    Alert.alert(
      'Delete Meal',
      `Remove "${meal.title}" from your log? This will subtract ${Math.round(meal.nutrition?.calories || 0)} calories from your daily tracking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(meal._id).unwrap();
              Toast.show({ type: 'success', text1: 'Meal Removed', text2: 'Your tracking has been updated.' });
            } catch {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete meal.' });
            }
          },
        },
      ],
    );
  }, [deleteMeal]);

  return (
    <View style={styles.content}>
      {meals.length > 0 && (
        <Card style={styles.mealsCard}>
          <View style={styles.mealsHeader}>
            <Text style={styles.sectionTitle}>Logged Meals</Text>
            <Text style={styles.mealsCount}>{meals.length} meal{meals.length !== 1 ? 's' : ''}</Text>
          </View>
          {dailySummary && (
            <View style={styles.mealsSummary}>
              <SummaryStat label="Total Cal" value={Math.round(dailySummary.totalCalories || 0)} />
              <SummaryStat label="Protein" value={`${Math.round(dailySummary.totalProtein || 0)}g`} />
              <SummaryStat label="Carbs" value={`${Math.round(dailySummary.totalNetCarbs || 0)}g`} />
              <SummaryStat label="Fat" value={`${Math.round(dailySummary.totalFat || 0)}g`} />
            </View>
          )}
          {meals.map((meal) => (
            <MealLogCard key={meal._id} meal={meal} onDelete={() => handleDeleteMeal(meal)} />
          ))}
        </Card>
      )}

      {userId && onFoodAnalyzed ? (
        <>
          <AiFoodScanner userId={userId} onFoodAnalyzed={onFoodAnalyzed} />
          <Text style={styles.divider}>Or enter manually</Text>
        </>
      ) : null}
      <Card>
        <Text style={styles.sectionTitle}>Calories</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Consumed (kcal)</Text>
          <TextInput
            style={styles.input}
            value={caloriesConsumed}
            onChangeText={onCaloriesConsumedChange}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Burned (kcal)</Text>
          <TextInput
            style={styles.input}
            value={caloriesBurned}
            onChangeText={onCaloriesBurnedChange}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
        <Button title="Save calories" onPress={onNutritionSave} disabled={saving} style={styles.saveBtn} />
      </Card>
      <Card style={styles.macrosCard}>
        <Text style={styles.sectionTitle}>Macronutrients (g)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Protein</Text>
          <TextInput style={styles.input} value={proteins} onChangeText={onProteinsChange} keyboardType="number-pad" placeholder="0" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Carbs</Text>
          <TextInput style={styles.input} value={carbs} onChangeText={onCarbsChange} keyboardType="number-pad" placeholder="0" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fats</Text>
          <TextInput style={styles.input} value={fats} onChangeText={onFatsChange} keyboardType="number-pad" placeholder="0" />
        </View>
        <Button title="Save macros" onPress={onMacrosSave} disabled={saving} style={styles.saveBtn} />
      </Card>
    </View>
  );
};

const SummaryStat = ({ label, value }) => (
  <View style={styles.summaryStatItem}>
    <Text style={styles.summaryStatValue}>{value}</Text>
    <Text style={styles.summaryStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { marginBottom: spacing.lg },
  divider: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  sectionTitle: { ...typography.h4, color: colors.mineShaft, marginBottom: spacing.md },
  row: { marginBottom: spacing.md },
  label: { ...typography.bodySmall, color: colors.raven, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  saveBtn: { marginTop: spacing.sm },
  macrosCard: { marginTop: spacing.lg },

  mealsCard: { marginBottom: spacing.lg },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealsCount: {
    ...typography.caption,
    color: colors.raven,
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  mealsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: `${colors.mainOrange}08`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.mainOrange,
  },
  summaryStatLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 1,
  },
});

export default NutritionTrackerSection;
