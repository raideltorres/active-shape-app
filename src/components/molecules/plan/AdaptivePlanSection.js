import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Trigger item with condition -> action flow
const TriggerItem = ({ trigger }) => {
  if (!trigger?.condition || !trigger?.action) return null;

  return (
    <View style={styles.triggerItem}>
      {/* Condition */}
      <View style={styles.triggerCondition}>
        <Ionicons name="warning" size={16} color="#f59e0b" style={styles.triggerIcon} />
        <Text style={styles.triggerText}>{trigger.condition}</Text>
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="arrow-down" size={16} color={colors.raven} />
      </View>

      {/* Action */}
      <View style={styles.triggerAction}>
        <Ionicons name="checkbox" size={16} color="#3b82f6" style={styles.triggerIcon} />
        <Text style={styles.triggerText}>{trigger.action}</Text>
      </View>
    </View>
  );
};

/**
 * Plan Review & Adjustments section for Plan screen
 */
const AdaptivePlanSection = ({ adaptive }) => {
  if (!adaptive) return null;

  const { reviewFrequency, adjustmentTriggers } = adaptive;

  // Handle old format (reviewSchedule string) vs new format (reviewFrequency number)
  const frequency = reviewFrequency || adaptive.reviewSchedule;
  
  if (!frequency) return null;

  return (
    <SectionCard title="Plan Review & Adjustments" icon="refresh-outline" color={colors.lima}>
      {/* Automatic Plan Reviews */}
      <View style={styles.mainCard}>
        <View style={styles.mainHeader}>
          <View style={styles.mainIconContainer}>
            <Ionicons name="sync" size={20} color={colors.white} />
          </View>
        </View>
        <Text style={styles.mainTitle}>Automatic Plan Reviews</Text>
        <Text style={styles.frequencyValue}>
          {typeof frequency === 'number' ? `${frequency} days` : frequency}
        </Text>
        <Text style={styles.mainDescription}>
          Your plan will be automatically reviewed and optimized based on your progress
        </Text>
      </View>

      {/* When to Reassess */}
      {adjustmentTriggers && adjustmentTriggers.length > 0 && (
        <View style={styles.triggersCard}>
          <Text style={styles.triggersTitle}>WHEN TO REASSESS YOUR PLAN</Text>
          {adjustmentTriggers.map((trigger, index) => (
            <TriggerItem key={index} trigger={trigger} />
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#eff6ff', // blue-50
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  mainHeader: {
    marginBottom: spacing.sm,
  },
  mainIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  frequencyValue: {
    ...typography.h2,
    color: colors.mineShaft,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  mainDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 20,
  },
  triggersCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  triggersTitle: {
    ...typography.labelUppercase,
    color: colors.raven,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  triggerItem: {
    marginBottom: spacing.md,
  },
  triggerCondition: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  triggerAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  triggerIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  triggerText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
});

export default AdaptivePlanSection;
