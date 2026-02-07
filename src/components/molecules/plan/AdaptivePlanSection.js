import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography } from '../../../theme';

/**
 * Plan Review & Adjustments section for Plan screen
 */
const AdaptivePlanSection = ({ adaptive }) => {
  if (!adaptive?.reviewSchedule) return null;

  return (
    <SectionCard title="Plan Review & Adjustments" icon="refresh-outline" color={colors.lima}>
      <View style={styles.content}>
        <View style={styles.item}>
          <Ionicons name="calendar" size={20} color={colors.lima} />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Review Schedule</Text>
            <Text style={styles.itemValue}>{adaptive.reviewSchedule}</Text>
          </View>
        </View>

        {adaptive.adjustmentTriggers && adaptive.adjustmentTriggers.length > 0 && (
          <View style={styles.triggers}>
            <Text style={styles.triggersTitle}>Adjustment Triggers</Text>
            {adaptive.adjustmentTriggers.map((trigger, index) => (
              <View key={index} style={styles.triggerItem}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.raven} />
                <Text style={styles.triggerText}>{trigger}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  content: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemContent: {
    marginLeft: spacing.sm,
  },
  itemTitle: {
    ...typography.caption,
    color: colors.raven,
  },
  itemValue: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  triggers: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  triggersTitle: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  triggerText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default AdaptivePlanSection;
