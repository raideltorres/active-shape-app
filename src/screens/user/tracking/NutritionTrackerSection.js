import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { Card } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const NutritionTrackerSection = ({
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
}) => (
  <View style={styles.content}>
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

const styles = StyleSheet.create({
  content: { marginBottom: spacing.lg },
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
});

export default NutritionTrackerSection;
