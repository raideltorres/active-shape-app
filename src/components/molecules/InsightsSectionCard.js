import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import ScoreRing from '../atoms/ScoreRing';

export const SECTION_CONFIG = {
  nutrition: { label: 'Nutrition', icon: 'food-apple-outline', color: colors.mainOrange },
  fitness: { label: 'Fitness', icon: 'dumbbell', color: colors.mariner },
  weight: { label: 'Weight', icon: 'scale-bathroom', color: colors.cinnabar },
  hydration: { label: 'Hydration', icon: 'water-outline', color: colors.lightBlue, isIonicon: true },
  supplements: { label: 'Supplements', icon: 'pill', color: colors.lima },
  fasting: { label: 'Fasting', icon: 'flash-outline', color: colors.buttercup, isIonicon: true },
};

const InsightsSectionCard = ({ sectionKey, section }) => {
  const config = SECTION_CONFIG[sectionKey];
  if (!section || !config) return null;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${config.color}15` }]}>
          {config.isIonicon ? (
            <Ionicons name={config.icon} size={20} color={config.color} />
          ) : (
            <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
          )}
        </View>
        <Text style={styles.sectionLabel}>{config.label}</Text>
        <ScoreRing score={section.score} size={48} strokeWidth={4} />
      </View>
      <Text style={styles.sectionAnalysis}>{section.analysis}</Text>
      {section.highlights && section.highlights.length > 0 && (
        <View style={styles.highlightsContainer}>
          {section.highlights.map((h, i) => {
            const text = typeof h === 'object' && h !== null ? h.text : h;
            const type = typeof h === 'object' && h !== null ? h.type : 'neutral';
            const iconName = type === 'positive' ? 'checkmark-circle' : type === 'negative' ? 'alert-circle' : 'information-circle';
            const iconColor = type === 'positive' ? colors.lima : type === 'negative' ? colors.cinnabar : colors.mainOrange;

            return (
              <View key={i} style={styles.highlightItem}>
                <Ionicons name={iconName} size={14} color={iconColor} style={styles.highlightIcon} />
                <Text style={styles.highlightText}>{text}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    ...typography.h4,
    color: colors.mineShaft,
    flex: 1,
  },
  sectionAnalysis: {
    ...typography.body,
    color: colors.raven,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlightsContainer: {
    gap: spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  highlightIcon: {
    marginTop: 2,
  },
  highlightText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
});

export default InsightsSectionCard;
