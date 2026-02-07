import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const ProgressItem = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.icon}>
      <Ionicons name={item.icon || 'checkmark-circle-outline'} size={20} color={colors.lima} />
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{item.metric || item.title}</Text>
      <Text style={styles.frequency}>{item.frequency}</Text>
    </View>
  </View>
);

/**
 * Progress Tracking Guide section for Plan screen
 */
const ProgressTrackingSection = ({ progressTracking }) => {
  if (!progressTracking?.metrics || progressTracking.metrics.length === 0) return null;

  return (
    <SectionCard title="Progress Tracking Guide" icon="analytics-outline" color={colors.havelockBlue}>
      {progressTracking.metrics.map((item, index) => (
        <ProgressItem key={index} item={item} />
      ))}

      {progressTracking.checkInFrequency && (
        <View style={styles.checkIn}>
          <Ionicons name="calendar-outline" size={16} color={colors.raven} />
          <Text style={styles.checkInText}>
            Check-in: {progressTracking.checkInFrequency}
          </Text>
        </View>
      )}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.lima}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.mineShaft,
  },
  frequency: {
    ...typography.caption,
    color: colors.raven,
  },
  checkIn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkInText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginLeft: spacing.xs,
  },
});

export default ProgressTrackingSection;
