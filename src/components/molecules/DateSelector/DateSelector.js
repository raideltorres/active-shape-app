import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";

import {
  addDays,
  subDays,
  formatLongDate,
  getRelativeDayLabel,
  getCurrentDate,
  isBefore,
  isAfter,
} from "../../../utils/date";
import { colors, spacing, typography, borderRadius } from "../../../theme";

const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 0 };
const DATE_GRADIENT_COLORS = ["#8A6BDB", "#6C8ADF"];
const BUTTON_BG = "rgba(169, 139, 223, 0.6)";

const DateSelector = ({
  selectedDate,
  onDateChange,
  maxDaysBack = 5,
  style,
}) => {
  const today = useMemo(() => getCurrentDate(), []);
  const oldestAllowedDate = useMemo(
    () => subDays(today, maxDaysBack),
    [today, maxDaysBack],
  );

  const canGoForward = useMemo(
    () => isBefore(selectedDate, today),
    [selectedDate, today],
  );
  const canGoBack = useMemo(
    () => isAfter(selectedDate, oldestAllowedDate),
    [selectedDate, oldestAllowedDate],
  );

  const handlePrevious = useCallback(() => {
    if (!canGoBack) return;
    onDateChange(subDays(selectedDate, 1));
  }, [canGoBack, selectedDate, onDateChange]);

  const handleNext = useCallback(() => {
    if (!canGoForward) return;
    onDateChange(addDays(selectedDate, 1));
  }, [canGoForward, selectedDate, onDateChange]);

  const displayDate = formatLongDate(selectedDate);
  const relativeDay = getRelativeDayLabel(selectedDate);

  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={DATE_GRADIENT_COLORS}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={[styles.button, !canGoBack && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={!canGoBack}
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.dateText} numberOfLines={2}>
            {displayDate}
          </Text>
          {relativeDay ? (
            <Text style={styles.relativeText}>{relativeDay}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, !canGoForward && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canGoForward}
          accessibilityLabel="Next day"
        >
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BUTTON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  dateText: {
    ...typography.h4,
    fontSize: 15,
    color: colors.white,
    textAlign: "center",
  },
  relativeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.white,
    marginTop: 2,
    opacity: 0.95,
  },
});

export default DateSelector;
