import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { Card } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const STEP_PRESETS = [
  { label: '1,000', value: 1000 },
  { label: '2,500', value: 2500 },
  { label: '5,000', value: 5000 },
  { label: '10,000', value: 10000 },
];

const RING_SIZE = 140;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const StepsTrackerSection = ({ totalSteps = 0, dailyGoal = 10000, onSave, saving }) => {
  const [stepsToAdd, setStepsToAdd] = useState(1000);
  const [customInput, setCustomInput] = useState('');

  const goalPercent = Math.min(100, Math.round((totalSteps / dailyGoal) * 100));
  const estimatedCalories = Math.round(totalSteps * 0.04);
  const estimatedDistance = (totalSteps * 0.000762).toFixed(1);

  const strokeDashoffset = RING_CIRCUMFERENCE - (goalPercent / 100) * RING_CIRCUMFERENCE;

  const handlePresetSelect = useCallback((value) => {
    setStepsToAdd(value);
    setCustomInput('');
  }, []);

  const handleCustomChange = useCallback((text) => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustomInput(clean);
    const num = parseInt(clean, 10);
    if (!Number.isNaN(num) && num > 0) setStepsToAdd(num);
  }, []);

  const handleSave = useCallback(() => {
    if (stepsToAdd > 0) onSave?.(stepsToAdd);
  }, [onSave, stepsToAdd]);

  return (
    <View>
      <Card>
        <Text style={styles.cardTitle}>Activity Tracking</Text>
        <Text style={styles.description}>
          Track your daily steps to monitor your physical activity. Walking improves cardiovascular health, aids weight management, and boosts mental well-being. Aim for 7,000–10,000 daily steps.
        </Text>

        <View style={styles.goalCard}>
          <View style={styles.goalCardLeft}>
            <Text style={styles.goalLabel}>DAILY STEP GOAL</Text>
            <Text style={styles.goalText}>
              {totalSteps.toLocaleString()} of {dailyGoal.toLocaleString()} steps
            </Text>
          </View>
          <Text style={styles.goalPercent}>{goalPercent}%</Text>
        </View>

        <View style={styles.bodyRow}>
          <View style={styles.detailsCol}>
            <Text style={styles.sectionTitle}>Log your steps</Text>
            <Text style={styles.sectionHint}>Select a preset or enter a custom amount.</Text>

            <View style={styles.presets}>
              {STEP_PRESETS.map((preset) => {
                const isActive = stepsToAdd === preset.value && !customInput;
                return (
                  <TouchableOpacity
                    key={preset.value}
                    style={[styles.presetBtn, isActive && styles.presetBtnActive]}
                    onPress={() => handlePresetSelect(preset.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetValue, isActive && styles.presetTextActive]}>{preset.label}</Text>
                    <Text style={[styles.presetLabel, isActive && styles.presetTextActive]}>steps</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.customInput}
              value={customInput}
              onChangeText={handleCustomChange}
              placeholder="Custom steps"
              placeholderTextColor={colors.alto}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Button
              title="Add Steps"
              onPress={handleSave}
              disabled={saving || stepsToAdd <= 0}
              icon="add"
              style={styles.addBtn}
            />
          </View>

          <View style={styles.ringCol}>
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={colors.gallery}
                  strokeWidth={RING_STROKE}
                  fill="transparent"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={colors.mainOrange}
                  strokeWidth={RING_STROKE}
                  fill="transparent"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Ionicons name="walk" size={22} color={colors.mainOrange} />
                <Text style={styles.ringValue}>{totalSteps.toLocaleString()}</Text>
                <Text style={styles.ringLabel}>steps</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{estimatedDistance} km</Text>
                <Text style={styles.metricLabel}>Distance</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{estimatedCalories}</Text>
                <Text style={styles.metricLabel}>Calories</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.info}>
          Distance is estimated using a 0.762m stride. Calorie burn is ~0.04 kcal/step.
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    ...typography.h3,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.mercury,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  goalCardLeft: { gap: 6 },
  goalLabel: {
    fontSize: 11,
    letterSpacing: 0.08,
    color: colors.raven,
    textTransform: 'uppercase',
  },
  goalText: { ...typography.bodySmall, color: colors.riverBed },
  goalPercent: { fontSize: 22, fontWeight: '700', color: colors.mainBlue },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailsCol: { flex: 1 },
  sectionTitle: { ...typography.h4, color: colors.mineShaft, marginBottom: 4 },
  sectionHint: { ...typography.caption, color: colors.raven, marginBottom: spacing.sm },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  presetBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gallery,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}12`,
  },
  presetValue: { ...typography.body, fontWeight: '700', color: colors.mineShaft },
  presetLabel: { ...typography.caption, color: colors.raven, fontSize: 10 },
  presetTextActive: { color: colors.mainOrange },
  customInput: {
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    marginBottom: spacing.sm,
  },
  addBtn: { marginBottom: spacing.sm },
  ringCol: { alignItems: 'center', justifyContent: 'center' },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { ...typography.h4, color: colors.mineShaft, marginTop: 2 },
  ringLabel: { ...typography.caption, color: colors.raven },
  metricsRow: { flexDirection: 'row', gap: spacing.lg },
  metric: { alignItems: 'center' },
  metricValue: { ...typography.body, fontWeight: '700', color: colors.mineShaft },
  metricLabel: { ...typography.caption, color: colors.raven },
  info: {
    ...typography.caption,
    color: colors.raven,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default StepsTrackerSection;
