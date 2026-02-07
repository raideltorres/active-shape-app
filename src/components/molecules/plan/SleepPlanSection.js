import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Helper to format time from "HH:MM" to "H AM/PM"
const formatTime = (time) => {
  if (!time) return '';
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
};

/**
 * Sleep Plan section for Plan screen
 */
const SleepPlanSection = ({ sleepPlan }) => {
  if (!sleepPlan?.targetHours) return null;

  return (
    <SectionCard title="Sleep Plan" icon="moon-outline" color={colors.purple}>
      <View style={styles.content}>
        <View style={styles.mainStat}>
          <Ionicons name="bed-outline" size={32} color={colors.purple} />
          <Text style={styles.hours}>{sleepPlan.targetHours}</Text>
          <Text style={styles.unit}>hours/night</Text>
        </View>

        {sleepPlan.bedtime && sleepPlan.wakeTime && (
          <View style={styles.schedule}>
            <View style={styles.timeItem}>
              <Ionicons name="moon" size={16} color={colors.raven} />
              <Text style={styles.timeLabel}>Bedtime</Text>
              <Text style={styles.timeValue}>{formatTime(sleepPlan.bedtime)}</Text>
            </View>
            <View style={styles.timeItem}>
              <Ionicons name="sunny" size={16} color={colors.mainOrange} />
              <Text style={styles.timeLabel}>Wake up</Text>
              <Text style={styles.timeValue}>{formatTime(sleepPlan.wakeTime)}</Text>
            </View>
          </View>
        )}

        {sleepPlan.tips && sleepPlan.tips.length > 0 && (
          <View style={styles.tips}>
            {sleepPlan.tips.slice(0, 3).map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.lima} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hours: {
    ...typography.h1,
    color: colors.purple,
    marginTop: spacing.xs,
  },
  unit: {
    ...typography.caption,
    color: colors.raven,
  },
  schedule: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
  },
  timeValue: {
    ...typography.bodyLarge,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  tips: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default SleepPlanSection;
