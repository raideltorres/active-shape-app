import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Default sleep hygiene tips if none provided
const DEFAULT_SLEEP_TIPS = [
  'Keep a consistent sleep schedule, even on weekends',
  'Avoid screens 1 hour before bed',
  'Keep your bedroom cool, dark, and quiet',
  'Limit caffeine after 2 PM',
];

/**
 * Sleep Plan section for Plan screen
 */
const SleepPlanSection = ({ sleepPlan }) => {
  if (!sleepPlan?.targetHours) return null;

  // Use provided tips or defaults
  const tips = sleepPlan.tips && sleepPlan.tips.length > 0 
    ? sleepPlan.tips 
    : DEFAULT_SLEEP_TIPS;

  return (
    <SectionCard title="Sleep Plan" icon="moon-outline" color={colors.mainOrange}>
      <View style={styles.content}>
        {/* Circular Sleep Display */}
        <View style={styles.circleContainer}>
          <LinearGradient
            colors={['#1e3a5f', '#2d5a87']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.circle}
          >
            <Ionicons name="moon" size={28} color="#fbbf24" style={styles.moonIcon} />
            <Text style={styles.hoursNumber}>{sleepPlan.targetHours}</Text>
            <Text style={styles.hoursLabel}>hours</Text>
          </LinearGradient>
        </View>

        {/* Sleep Hygiene Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Sleep Hygiene Tips</Text>
          {tips.slice(0, 4).map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.lima} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  moonIcon: {
    marginBottom: spacing.xs,
  },
  hoursNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 46,
  },
  hoursLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  tipsSection: {
    width: '100%',
  },
  tipsTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.raven,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 22,
  },
});

export default SleepPlanSection;
