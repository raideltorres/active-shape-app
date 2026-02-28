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

const RING_SIZE = 150;
const RING_STROKE = 8;
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
          Track your daily steps to monitor your physical activity. Walking is one of the most effective forms of
          exercise — it improves cardiovascular health, aids weight management, and boosts mental well-being. The WHO
          recommends at least 150 minutes of moderate activity per week, and 7,000–10,000 daily steps is a strong
          indicator of meeting that goal.
        </Text>

        <View style={styles.greenDivider} />

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

          <View style={styles.statsPanel}>
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={RING_STROKE}
                  fill="transparent"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={colors.lima}
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
                <Ionicons name="walk" size={22} color={colors.white} />
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

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>How we calculate: </Text>
            Distance is estimated using an average stride length of 0.762m. Calorie burn is approximated at ~0.04 kcal
            per step (varies by weight, pace, and terrain).
          </Text>
        </View>
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
  greenDivider: {
    height: 2,
    backgroundColor: colors.lima,
    marginBottom: spacing.lg,
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
  goalPercent: { fontSize: 22, fontWeight: '700', color: colors.lima },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
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
    width: '48%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gallery,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: colors.lima,
    backgroundColor: `${colors.lima}0D`,
  },
  presetValue: { ...typography.body, fontWeight: '700', color: colors.mineShaft },
  presetLabel: { ...typography.caption, color: colors.raven, fontSize: 10 },
  presetTextActive: { color: colors.lima },
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
  statsPanel: {
    width: 170,
    backgroundColor: colors.mainBlue,
    borderRadius: 18,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  ringLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricsRow: { flexDirection: 'row', gap: spacing.lg },
  metric: { alignItems: 'center' },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  metricLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: `${colors.lima}0F`,
    borderWidth: 1,
    borderColor: `${colors.lima}26`,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.raven,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '700',
  },
});

export default StepsTrackerSection;
