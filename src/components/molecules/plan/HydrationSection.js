import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Helper to format time to AM/PM
const formatTime = (time) => {
  if (!time) return '';
  // If already in AM/PM format, return as is
  if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
    return time.toUpperCase();
  }
  // Parse HH:MM format
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12} ${period}`;
};

/**
 * Hydration Schedule section for Plan screen
 */
const HydrationSection = ({ hydrationPlan }) => {
  if (!hydrationPlan?.dailyWaterGoal) return null;

  const schedule = hydrationPlan.schedule || [];

  return (
    <SectionCard title="Hydration Schedule" icon="water-outline" color={colors.havelockBlue}>
      {/* Daily Goal Header */}
      <View style={styles.goalHeader}>
        <Ionicons name="water" size={32} color={colors.havelockBlue} />
        <View style={styles.goalTextContainer}>
          <Text style={styles.goalValue}>{hydrationPlan.dailyWaterGoal}L</Text>
          <Text style={styles.goalLabel}>DAILY GOAL</Text>
        </View>
      </View>

      {/* Rationale */}
      {hydrationPlan.rationale && (
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleText}>{hydrationPlan.rationale}</Text>
        </View>
      )}

      {/* Schedule Grid */}
      {schedule.length > 0 && (
        <View style={styles.scheduleGrid}>
          {schedule.map((item, index) => (
            <View key={index} style={styles.scheduleCard}>
              <Text style={styles.cardTime}>{formatTime(item.time)}</Text>
              <Text style={styles.cardAmount}>{item.amount}ml</Text>
              {item.description && (
                <Text style={styles.cardDescription}>{item.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.havelockBlue}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  goalTextContainer: {
    marginLeft: spacing.md,
  },
  goalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.mineShaft,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.raven,
    letterSpacing: 1,
  },
  rationaleContainer: {
    backgroundColor: `${colors.havelockBlue}08`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scheduleCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gallery,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  cardTime: {
    ...typography.caption,
    color: colors.havelockBlue,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.raven,
    textAlign: 'center',
  },
});

export default HydrationSection;
