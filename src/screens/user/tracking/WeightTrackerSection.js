import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Card, ValuePicker, WeightProgressCard } from '../../../components/molecules';
import { colors, spacing } from '../../../theme';
import { fromKgToLbs, fromLbsToKg, formatWeightKg, formatWeightLbs } from '../../../utils/measure';

const WEIGHT_MIN = 20;
const WEIGHT_MAX = 200;
const WEIGHT_STEP = 0.1;

const WeightTrackerSection = ({
  weightInputValue,
  onWeightInputChange,
  onWeightSave,
  saving,
  weightChartData,
  initialWeight,
  goalWeight,
  profileCreatedAt,
  displayWeightNum = 70,
}) => {
  return (
    <View style={styles.content}>
      <Card>
        <ValuePicker
          title="Weight"
          description="Monitor your weight journey by logging your current weight daily. The chart below shows your
          progress over time, helping you visualize trends and stay motivated. Consistent tracking is
          key to achieving your fitness goals. For best results, weigh yourself at the same time each
          day, preferably in the morning before eating."
          value={weightInputValue}
          onChange={onWeightInputChange}
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          step={WEIGHT_STEP}
          unit="kg"
          alternativeUnit="lbs"
          convertToAlternative={(kg) => fromKgToLbs(kg).lbs}
          convertFromAlternative={fromLbsToKg}
          formatMainValue={formatWeightKg}
          formatAlternativeValue={formatWeightLbs}
          showSaveButton
          onSave={onWeightSave}
          loading={saving}
          saveButtonLabel="Record New Weight"
        />
      </Card>

      <View style={styles.chartSection}>
        <WeightProgressCard
          weightData={(weightChartData || []).map((r) => ({ date: r.date, weight: r.weight }))}
          initialWeight={initialWeight}
          currentWeight={weightChartData?.length ? weightChartData[weightChartData.length - 1].weight : null}
          goalWeight={goalWeight}
          profileCreatedAt={profileCreatedAt}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { marginBottom: spacing.lg },
  chartSection: {
    marginTop: spacing.lg,
  },
});

export default WeightTrackerSection;
