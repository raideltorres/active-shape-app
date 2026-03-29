import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { WEEKDAYS_SHORT } from "../../utils/date";
import { colors, spacing, typography, borderRadius } from "../../theme";

const WEEKDAYS_MON = [...WEEKDAYS_SHORT.slice(1), WEEKDAYS_SHORT[0]];

const FastingCalendarGrid = ({
  calendarDays,
  selectedDate,
  onSelectDate,
  today,
  month,
  year,
}) => (
  <>
    <View style={styles.weekdaysRow}>
      {WEEKDAYS_MON.map((d) => (
        <View key={d} style={styles.weekdayCell}>
          <Text style={styles.weekdayText}>{d}</Text>
        </View>
      ))}
    </View>

    <View style={styles.calendarGrid}>
      {calendarDays.map((item) => {
        if (item.empty) {
          return <View key={item.key} style={styles.dayCell} />;
        }

        const hasFasting = !!item.data;
        const isSelected = selectedDate === item.date;
        const isToday =
          item.day === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear();

        const cellContent = (
          <>
            <Text
              style={[
                styles.dayText,
                hasFasting && styles.dayTextFasting,
                isToday && !hasFasting && styles.dayTextToday,
              ]}
            >
              {item.day}
            </Text>
            {hasFasting && (
              <View style={styles.dayIndicator}>
                <Ionicons name="flame" size={9} color="rgba(255,255,255,0.9)" />
                <Text style={styles.dayIndicatorText}>
                  {(item.data.totalHours || 0).toFixed(1)}h
                </Text>
              </View>
            )}
          </>
        );

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.dayCellOuter}
            onPress={() => onSelectDate(item.date)}
            activeOpacity={0.7}
          >
            {hasFasting ? (
              <LinearGradient
                colors={[colors.purpleGradientStart, colors.purpleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.dayGradient,
                  isToday && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
              >
                {cellContent}
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.dayInner,
                  isToday && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
              >
                {cellContent}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </>
);

const styles = StyleSheet.create({
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.raven,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCellOuter: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.mainOrange,
  },
  dayCellSelected: {
    borderWidth: 2.5,
    borderColor: colors.mainBlue,
  },
  dayGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md - 1,
  },
  dayInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md - 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.mineShaft,
  },
  dayTextFasting: {
    color: colors.white,
  },
  dayTextToday: {
    color: colors.mainOrange,
    fontWeight: "700",
  },
  dayIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginTop: 1,
  },
  dayIndicatorText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
});

export default FastingCalendarGrid;
