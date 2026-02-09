import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Tracking category configuration matching web
const TRACKING_CONFIG = {
  weighIn: {
    title: 'WEIGH IN',
    icon: 'scale-outline',
    color: '#3b82f6', // blue
  },
  checkIn: {
    title: 'CHECK-IN',
    icon: 'calendar-outline',
    color: '#10b981', // green
  },
  photos: {
    title: 'PROGRESS PHOTOS',
    icon: 'camera-outline',
    color: '#8b5cf6', // purple
  },
  measurements: {
    title: 'MEASUREMENTS',
    icon: 'resize-outline',
    color: '#f59e0b', // amber
  },
};

// Single tracking card
const TrackingCard = ({ type, data }) => {
  if (!data) return null;

  const config = TRACKING_CONFIG[type];
  if (!config) return null;

  const frequency = data.frequency || null;
  const items = data.items || null;
  const tip = data.tip || null;

  // For measurements, show count as heading
  const displayValue = frequency || (items ? `${items.length} Areas` : null);

  if (!displayValue && !items) return null;

  return (
    <View style={styles.trackingCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={16} color={colors.white} />
        </View>
        <Text style={styles.cardTitle}>{config.title}</Text>
      </View>

      {/* Value */}
      {displayValue && (
        <Text style={styles.cardValue}>{displayValue}</Text>
      )}

      {/* Tags for measurements */}
      {items && items.length > 0 && (
        <View style={styles.tagsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tip */}
      {tip && (
        <Text style={styles.tipText}>{tip}</Text>
      )}
    </View>
  );
};

// Helper to normalize old format to new format
const normalizeData = (progressTracking) => {
  // Check if it's the new format (has weighIn object)
  if (progressTracking.weighIn) {
    return progressTracking;
  }

  // Convert old format to new format for backward compatibility
  return {
    weighIn: {
      frequency: progressTracking.weighInFrequency,
      tip: null,
    },
    checkIn: {
      frequency: progressTracking.checkInFrequency,
      tip: null,
    },
    photos: {
      frequency: progressTracking.photoFrequency,
      tip: null,
    },
    measurements: {
      items: progressTracking.measurementsToTrack,
      tip: null,
    },
    rationale: progressTracking.rationale || null,
  };
};

/**
 * Progress Tracking Guide section for Plan screen
 */
const ProgressTrackingSection = ({ progressTracking }) => {
  if (!progressTracking) return null;

  const data = normalizeData(progressTracking);

  return (
    <SectionCard title="Progress Tracking Guide" icon="analytics-outline" color={colors.havelockBlue}>
      {/* Rationale */}
      {data.rationale && (
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleText}>{data.rationale}</Text>
        </View>
      )}

      {/* Tracking Cards */}
      <TrackingCard type="weighIn" data={data.weighIn} />
      <TrackingCard type="checkIn" data={data.checkIn} />
      <TrackingCard type="photos" data={data.photos} />
      <TrackingCard type="measurements" data={data.measurements} />
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  rationaleContainer: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.havelockBlue,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rationaleText: {
    ...typography.bodySmall,
    color: colors.raven,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  trackingCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.labelUppercase,
    color: colors.raven,
    letterSpacing: 0.5,
  },
  cardValue: {
    ...typography.h3,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  tagText: {
    ...typography.caption,
    color: colors.mineShaft,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});

export default ProgressTrackingSection;
