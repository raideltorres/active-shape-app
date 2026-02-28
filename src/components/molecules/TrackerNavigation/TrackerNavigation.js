import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';

const TRACKER_ICONS = {
  water: 'water',
  weight: 'scale-outline',
  nutrition: 'nutrition-outline',
  activity: 'fitness-outline',
};

const TrackerNavigation = ({ trackers, activeTracker, onTrackerSelect, extraCards }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {trackers.map((tracker) => {
        const isActive = activeTracker === tracker.id;
        const iconName = TRACKER_ICONS[tracker.id] || 'ellipse-outline';

        return (
          <TouchableOpacity
            key={tracker.id}
            style={[styles.card, isActive && styles.cardActive]}
            onPress={() => onTrackerSelect(tracker.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons name={iconName} size={22} color={isActive ? colors.white : colors.mineShaft} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tracker.label}</Text>
            <Text style={[styles.status, tracker.isTracked && styles.statusTracked]} numberOfLines={1}>
              {tracker.statusText}
            </Text>
          </TouchableOpacity>
        );
      })}

      {extraCards?.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={[styles.card, styles.cardAccent]}
          onPress={card.onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, styles.iconWrapAccent]}>
            <Ionicons name={card.icon} size={22} color={colors.white} />
          </View>
          <Text style={[styles.label, styles.labelAccent]}>{card.label}</Text>
          <Text style={styles.status} numberOfLines={1}>{card.statusText}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  card: {
    width: 90,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
  },
  cardAccent: {
    borderColor: colors.mainBlue,
    backgroundColor: `${colors.mainBlue}08`,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.alabaster,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconWrapActive: {
    backgroundColor: colors.mainOrange,
  },
  iconWrapAccent: {
    backgroundColor: colors.mainBlue,
  },
  label: {
    ...typography.label,
    color: colors.mineShaft,
    marginBottom: 2,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.mainOrange,
  },
  labelAccent: {
    color: colors.mainBlue,
  },
  status: {
    ...typography.caption,
    color: colors.raven,
    textAlign: 'center',
  },
  statusTracked: {
    color: colors.lima,
    fontWeight: '600',
  },
});

export default TrackerNavigation;
