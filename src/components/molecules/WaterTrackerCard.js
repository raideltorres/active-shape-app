import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from './Card';
import { colors, spacing, typography, borderRadius } from '../../theme';

/**
 * Water tracking card with quick add buttons
 */
const WaterTrackerCard = ({ consumed = 0, goal = 2500, onAddWater }) => {
  const progress = Math.min((consumed / goal) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);

  const quickAddOptions = [250, 500];

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="water" size={20} color={colors.havelockBlue} />
        </View>
        <Text style={styles.title}>Water Intake</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.consumedValue}>{(consumed / 1000).toFixed(1)}L</Text>
          <Text style={styles.goalText}>of {(goal / 1000).toFixed(1)}L</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.remainingText}>
          {remaining > 0 ? `${(remaining / 1000).toFixed(1)}L remaining` : 'Goal reached! 🎉'}
        </Text>
      </View>

      <View style={styles.quickAddSection}>
        {quickAddOptions.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickAddButton}
            onPress={() => onAddWater?.(amount)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={colors.havelockBlue} />
            <Text style={styles.quickAddText}>{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.havelockBlue}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  consumedValue: {
    ...typography.h2,
    color: colors.havelockBlue,
  },
  goalText: {
    ...typography.body,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gallery,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.havelockBlue,
    borderRadius: 4,
  },
  remainingText: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  quickAddSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.havelockBlue}10`,
    borderWidth: 1,
    borderColor: colors.havelockBlue,
  },
  quickAddText: {
    ...typography.bodySmall,
    color: colors.havelockBlue,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default WaterTrackerCard;
