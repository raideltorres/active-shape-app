import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

/**
 * Hydration Schedule section for Plan screen
 */
const HydrationSection = ({ hydrationPlan }) => {
  if (!hydrationPlan?.schedule || hydrationPlan.schedule.length === 0) return null;

  return (
    <SectionCard title="Hydration Schedule" icon="water-outline" color={colors.havelockBlue}>
      <View style={styles.goal}>
        <Text style={styles.goalValue}>{hydrationPlan.dailyWaterGoal}L</Text>
        <Text style={styles.goalLabel}>daily goal</Text>
      </View>

      <View style={styles.schedule}>
        {hydrationPlan.schedule.slice(0, 6).map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      {hydrationPlan.rationale && (
        <Text style={styles.rationale}>{hydrationPlan.rationale}</Text>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  goal: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  goalValue: {
    ...typography.h1,
    color: colors.havelockBlue,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  schedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: `${colors.havelockBlue}10`,
    borderRadius: borderRadius.md,
  },
  time: {
    ...typography.caption,
    color: colors.raven,
  },
  amount: {
    ...typography.body,
    color: colors.havelockBlue,
    fontWeight: '600',
  },
  rationale: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
});

export default HydrationSection;
