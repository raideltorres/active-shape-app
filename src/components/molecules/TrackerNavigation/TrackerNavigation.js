import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography, borderRadius } from "../../../theme";
import { shadows } from '../../../theme/shadows';

const TRACKER_ICONS = {
  water: "water",
  weight: "scale-outline",
  nutrition: "nutrition-outline",
  activity: "fitness-outline",
  supplements: "medical-outline",
};

const TrackerNavigation = ({ trackers, activeTracker, onTrackerSelect }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {trackers.map((tracker) => {
          const isActive = activeTracker === tracker.id;
          const iconName = TRACKER_ICONS[tracker.id] || "ellipse-outline";

          return (
            <TouchableOpacity
              key={tracker.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onTrackerSelect(tracker.id)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconWrap, isActive && styles.iconWrapActive]}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isActive ? colors.white : colors.mineShaft}
                />
              </View>
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {tracker.label}
              </Text>
              <Text
                style={[
                  styles.status,
                  tracker.isTracked && styles.statusTracked,
                ]}
                numberOfLines={1}
              >
                {tracker.statusText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  card: {
    minWidth: 100,
    flexGrow: 1,
    flexShrink: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.card,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardActive: {
    borderColor: colors.mainBlue,
    backgroundColor: `${colors.mainBlue}06`,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.alabaster,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  iconWrapActive: {
    backgroundColor: colors.mainBlue,
  },
  label: {
    ...typography.label,
    color: colors.mineShaft,
    marginBottom: 2,
    textAlign: "center",
  },
  labelActive: {
    color: colors.mainBlue,
  },
  status: {
    ...typography.caption,
    color: colors.raven,
    textAlign: "center",
  },
  statusTracked: {
    color: colors.lima,
    fontWeight: "600",
  },
});

export default TrackerNavigation;
