import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Weight stat card with gradient background
const WeightStatCard = ({ icon, label, value, unit, iconColor }) => (
  <LinearGradient
    colors={['#667eea', '#764ba2']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.weightStatCard}
  >
    <View style={styles.weightStatHeader}>
      <Text style={styles.weightStatLabel}>{label}</Text>
    </View>
    <View style={styles.weightStatValue}>
      <Ionicons name={icon} size={16} color={iconColor || colors.white} style={styles.weightStatIcon} />
      <Text style={styles.weightStatNumber}>{value}</Text>
      <Text style={styles.weightStatUnit}>{unit}</Text>
    </View>
  </LinearGradient>
);

// Milestone icons based on position
const getMilestoneIcon = (index, total) => {
  if (index === 0) return 'flag';
  if (index === total - 1) return 'trophy';
  return 'star';
};

// Milestone colors based on position
const getMilestoneIconColor = (index, total) => {
  if (index === 0) return colors.havelockBlue;
  if (index === total - 1) return colors.mainOrange;
  return colors.purple;
};

// Vertical milestone item with icon above card
const MilestoneItem = ({ milestone, index, total }) => {
  const weekLabel = milestone.week || milestone.weekNumber 
    ? `WEEK ${milestone.weekNumber || (index + 1) * 4}` 
    : `WEEK ${(index + 1) * 4}`;
  const iconColor = getMilestoneIconColor(index, total);
  
  // Progress is position-based: first milestone = 25%, second = 50%, etc.
  const progressPercent = ((index + 1) / total) * 100;
  
  // Description text - try multiple possible field names
  const descriptionText = milestone.celebration || milestone.description || milestone.message || '';
  
  return (
    <View style={[styles.milestoneItem, index > 0 && styles.milestoneItemSpacing]}>
      {/* Icon with outer glow */}
      <View style={[styles.milestoneIconOuter, { backgroundColor: `${iconColor}25` }]}>
        <View style={[styles.milestoneIconContainer, { backgroundColor: iconColor }]}>
          <Ionicons 
            name={getMilestoneIcon(index, total)} 
            size={20} 
            color={colors.white} 
          />
        </View>
      </View>
      
      {/* Card */}
      <View style={styles.milestoneCard}>
        <View style={styles.milestoneCardHeader}>
          <View style={[styles.milestoneWeekBadge, { backgroundColor: iconColor }]}>
            <Text style={styles.milestoneWeekBadgeText}>{weekLabel}</Text>
          </View>
          <Text style={styles.milestoneCardWeight}>{milestone.weight}kg</Text>
        </View>
        {/* Progress Bar */}
        <View style={styles.milestoneProgressBar}>
          <View 
            style={[
              styles.milestoneProgressFill, 
              { backgroundColor: iconColor, width: `${progressPercent}%` }
            ]} 
          />
        </View>
        {descriptionText ? (
          <Text style={styles.milestoneCardDescription}>
            {descriptionText}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

/**
 * Weight Management Section for Plan Screen
 */
const WeightManagementSection = ({ weightPlan }) => {
  if (!weightPlan) return null;

  return (
    <SectionCard title="Weight Management" icon="scale-outline" color={colors.purple}>
      {/* Weight Stats Row */}
      <View style={styles.weightStatsRow}>
        <WeightStatCard
          icon="arrow-up"
          label="Current Weight"
          value={weightPlan.currentWeight}
          unit="kg"
        />
        <WeightStatCard
          icon={weightPlan.weeklyTargetChange < 0 ? 'arrow-down' : 'arrow-up'}
          label="Weekly Target"
          value={Math.abs(weightPlan.weeklyTargetChange || weightPlan.weeklyGoal || 0.5)}
          unit="kg/week"
        />
        <WeightStatCard
          icon="checkmark-circle"
          label="Estimated Timeline"
          value={weightPlan.estimatedTimeToGoal || weightPlan.estimatedTimeWeeks || '--'}
          unit="weeks"
        />
      </View>

      {/* Rationale */}
      {weightPlan.rationale && (
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleText}>{weightPlan.rationale}</Text>
        </View>
      )}

      {/* Milestones */}
      {weightPlan.milestones && weightPlan.milestones.length > 0 && (
        <View style={styles.milestonesContainer}>
          <Text style={styles.milestonesTitle}>Your Journey Milestones</Text>
          
          {weightPlan.milestones.slice(0, 4).map((milestone, index) => (
            <MilestoneItem
              key={index}
              milestone={milestone}
              index={index}
              total={Math.min(weightPlan.milestones.length, 4)}
            />
          ))}
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  weightStatsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weightStatCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginHorizontal: 2,
  },
  weightStatHeader: {
    marginBottom: spacing.xs,
  },
  weightStatLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  weightStatValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightStatIcon: {
    marginRight: spacing.xs,
  },
  weightStatNumber: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  weightStatUnit: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
    marginLeft: spacing.xs,
  },
  rationaleContainer: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.purple,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 22,
  },
  milestonesContainer: {
    marginTop: spacing.sm,
  },
  milestonesTitle: {
    ...typography.h3,
    color: colors.mineShaft,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  milestoneItem: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  milestoneItemSpacing: {
    marginTop: spacing.lg,
  },
  milestoneIconOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  milestoneIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  milestoneWeekBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  milestoneWeekBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  milestoneCardWeight: {
    ...typography.h4,
    color: colors.mineShaft,
    fontWeight: '700',
  },
  milestoneProgressBar: {
    height: 4,
    backgroundColor: colors.gallery,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  milestoneCardDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});

export default WeightManagementSection;
