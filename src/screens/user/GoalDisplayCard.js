import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';

const GoalDisplayCard = ({ icon, title, current, target, progress, color }) => (
  <View style={styles.goalCard}>
    <View style={styles.goalHeader}>
      <View style={[styles.goalIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.goalInfo}>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={styles.goalTarget}>Target: {target}</Text>
      </View>
      <Text style={[styles.goalCurrent, { color }]}>{current}</Text>
    </View>
    <View style={styles.goalProgress}>
      <View style={styles.goalProgressBar}>
        <View
          style={[
            styles.goalProgressFill,
            { width: `${Math.min(progress, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.goalProgressText}>{Math.round(progress)}%</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  goalTarget: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  goalCurrent: {
    ...typography.h3,
    fontWeight: '700',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gallery,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressText: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
});

export default GoalDisplayCard;
