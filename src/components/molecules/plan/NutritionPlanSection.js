import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Chart colors matching web
const CHART_COLORS = {
  protein: '#52c41a',
  carbs: '#1890ff',
  fats: '#faad14',
};

/**
 * Nutrition Plan section for Plan screen
 */
const NutritionPlanSection = ({ nutritionPlan, mealTiming }) => {
  const daily = nutritionPlan?.daily || nutritionPlan || {};
  
  const proteinVal = daily.protein || 0;
  const carbsVal = daily.carbs || 0;
  const fatsVal = daily.fats || 0;
  
  // Prepare pie chart data (values shown in legend only for reliability)
  const pieData = [
    { value: proteinVal, color: CHART_COLORS.protein },
    { value: carbsVal, color: CHART_COLORS.carbs },
    { value: fatsVal, color: CHART_COLORS.fats },
  ];

  const hasData = proteinVal + carbsVal + fatsVal > 0;

  return (
    <SectionCard title="Daily Nutrition Goals" icon="pie-chart-outline" color={colors.mainOrange}>
      {/* Pie Chart */}
      {hasData && (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            radius={100}
            innerRadius={0}
            focusOnPress={false}
          />
        </View>
      )}

      {/* Legend with amounts */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.protein }]} />
          <Text style={styles.legendText}>Protein ({proteinVal}g)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.carbs }]} />
          <Text style={styles.legendText}>Carbs ({carbsVal}g)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.fats }]} />
          <Text style={styles.legendText}>Fats ({fatsVal}g)</Text>
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
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.mineShaft,
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
