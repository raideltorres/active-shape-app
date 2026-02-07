import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Weight stat card with gradient background
const WeightStatCard = ({ icon, label, value, unit, iconColor }) => (
  <LinearGradient
    colors={[colors.purple, '#8B5CF6']}
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

const getMilestoneIconColor = (index, total) => {
  if (index === total - 1) return colors.mainOrange;
  return colors.purple;
};

// Horizontal milestone card
const MilestoneCard = ({ milestone, index, total, currentWeight }) => {
  const isReached = currentWeight && milestone.weight >= currentWeight;
  const weekLabel = milestone.week || `WEEK ${(index + 1) * 4}`;
  
  return (
    <View style={styles.milestoneCard}>
      <View style={styles.milestoneCardHeader}>
        <View style={[styles.milestoneWeekBadge, isReached && styles.milestoneWeekBadgeReached]}>
          <Text style={styles.milestoneWeekBadgeText}>{weekLabel}</Text>
        </View>
        <Text style={styles.milestoneCardWeight}>{milestone.weight}kg</Text>
      </View>
      {milestone.description && (
        <Text style={styles.milestoneCardDescription} numberOfLines={3}>
          {milestone.description}
        </Text>
      )}
    </View>
  );
};

// Timeline with icons
const MilestoneTimeline = ({ milestones }) => {
  const total = Math.min(milestones.length, 4);
  
  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineLine} />
      <View style={styles.timelineIcons}>
        {milestones.slice(0, 4).map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.timelineIconContainer,
              { backgroundColor: getMilestoneIconColor(index, total) }
            ]}
          >
            <Ionicons 
              name={getMilestoneIcon(index, total)} 
              size={16} 
              color={colors.white} 
            />
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Weight Management section for Plan screen
 */
const WeightManagementSection = ({ weightPlan }) => {
  if (!weightPlan?.currentWeight) return null;

  return (
    <SectionCard title="Weight Management" icon="scale-outline" color={colors.mainOrange}>
      {/* Stat Cards Row */}
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
          <View style={styles.rationaleAccent} />
          <Text style={styles.rationaleText}>{weightPlan.rationale}</Text>
        </View>
      )}

      {/* Milestones */}
      {weightPlan.milestones && weightPlan.milestones.length > 0 && (
        <View style={styles.milestonesContainer}>
          <Text style={styles.milestonesTitle}>Your Journey Milestones</Text>
          
          <MilestoneTimeline milestones={weightPlan.milestones} />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.milestonesScroll}
            contentContainerStyle={styles.milestonesScrollContent}
          >
            {weightPlan.milestones.slice(0, 4).map((milestone, index) => (
              <MilestoneCard
                key={index}
                milestone={milestone}
                index={index}
                total={Math.min(weightPlan.milestones.length, 4)}
                currentWeight={weightPlan.currentWeight}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  // Weight Stats Row
  weightStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
    marginRight: 4,
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
    marginLeft: 4,
  },
  // Rationale
  rationaleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rationaleAccent: {
    width: 4,
    backgroundColor: colors.purple,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    flex: 1,
  },
  // Milestones
  milestonesContainer: {
    marginTop: spacing.sm,
  },
  milestonesTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.lg,
  },
  // Timeline
  timelineContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  timelineLine: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: 16,
    height: 3,
    backgroundColor: colors.purple,
    borderRadius: 2,
  },
  timelineIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  // Milestone Cards
  milestonesScroll: {
    marginHorizontal: -spacing.lg,
  },
  milestonesScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 160,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneWeekBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  milestoneWeekBadgeReached: {
    backgroundColor: colors.lima,
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
  },
  milestoneCardDescription: {
    ...typography.caption,
    color: colors.raven,
    lineHeight: 16,
  },
});

export default WeightManagementSection;
