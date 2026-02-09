import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { Card, WeightProgressCard } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const WeightTrackerSection = ({
  weightInputValue,
  onWeightInputChange,
  onWeightSave,
  saving,
  weightChartData,
  initialWeight,
  goalWeight,
  profileCreatedAt,
}) => (
  <View style={styles.content}>
    <Card>
      <Text style={styles.sectionTitle}>Log weight (kg)</Text>
      <View style={styles.weightRow}>
        <TextInput
          style={styles.weightInput}
          value={weightInputValue}
          onChangeText={onWeightInputChange}
          keyboardType="decimal-pad"
          placeholder="e.g. 72.5"
        />
        <Button title="Save" onPress={onWeightSave} disabled={saving} />
      </View>
    </Card>
    {weightChartData.length > 0 && (
      <View style={styles.chartSection}>
        <WeightProgressCard
          weightData={weightChartData.map((r) => ({ date: r.date, weight: r.weight }))}
          initialWeight={initialWeight}
          currentWeight={weightChartData[weightChartData.length - 1].weight}
          goalWeight={goalWeight}
          profileCreatedAt={profileCreatedAt}
        />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  content: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.mineShaft, marginBottom: spacing.md },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  chartSection: { marginTop: spacing.lg },
});

export default WeightTrackerSection;
