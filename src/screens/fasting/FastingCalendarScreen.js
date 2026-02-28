import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useGetFastingCalendarQuery } from "../../store/api";
import { getCurrentStage } from "../../constants/fasting";
import { getMonthRange, secondsToShortTime } from "../../utils/fasting";
import { colors, spacing, typography, borderRadius } from "../../theme";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getIntensityColor = (hours) => {
  if (hours >= 20) return colors.mainOrange;
  if (hours >= 16) return `${colors.mainOrange}CC`;
  if (hours >= 12) return `${colors.mainOrange}88`;
  if (hours >= 6) return `${colors.mainOrange}55`;
  return `${colors.mainOrange}30`;
};

const FastingCalendarScreen = ({ navigation }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const { startDate, endDate } = useMemo(
    () => getMonthRange(year, month),
    [year, month],
  );

  const { data: calendarData, isLoading } = useGetFastingCalendarQuery({
    startDate,
    endDate,
  });

  const calendarMap = useMemo(() => {
    const map = {};
    if (Array.isArray(calendarData)) {
      calendarData.forEach((entry) => {
        map[entry.date] = entry;
      });
    }
    return map;
  }, [calendarData]);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }, [month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ key: `empty-${i}`, empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        key: dateStr,
        day: d,
        date: dateStr,
        data: calendarMap[dateStr],
      });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek, calendarMap]);

  const selectedDayData = selectedDate ? calendarMap[selectedDate] : null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fasting Calendar</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("FastingHistory")}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={16} color={colors.raven} />
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, styles.tabActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.mainOrange}
          />
          <Text style={[styles.tabText, styles.tabTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("FastingStats")}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={colors.raven} />
          <Text style={styles.tabText}>Stats</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.mainBlue} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} hitSlop={8}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.mainBlue}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.mainBlue}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          <>
            {/* Weekday headers */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((d) => (
                <View key={d} style={styles.weekdayCell}>
                  <Text style={styles.weekdayText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
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

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isToday && !isSelected && styles.dayCellToday,
                    ]}
                    onPress={() => setSelectedDate(item.date)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isToday && !isSelected && styles.dayTextToday,
                      ]}
                    >
                      {item.day}
                    </Text>
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: hasFasting
                            ? isSelected
                              ? colors.white
                              : getIntensityColor(item.data.totalHours || 0)
                            : "transparent",
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected day detail */}
            {selectedDate && (
              <View style={styles.dayDetail}>
                <Text style={styles.dayDetailDate}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </Text>

                {selectedDayData ? (
                  <View style={styles.dayDetailContent}>
                    <View style={styles.dayDetailRow}>
                      <View style={styles.dayDetailStat}>
                        <Ionicons
                          name="timer-outline"
                          size={18}
                          color={colors.mainBlue}
                        />
                        <Text style={styles.dayDetailValue}>
                          {(selectedDayData.totalHours || 0).toFixed(1)}h
                        </Text>
                        <Text style={styles.dayDetailLabel}>Total</Text>
                      </View>
                      <View style={styles.dayDetailStat}>
                        <Ionicons
                          name="list-outline"
                          size={18}
                          color={colors.mainOrange}
                        />
                        <Text style={styles.dayDetailValue}>
                          {selectedDayData.sessionCount || 0}
                        </Text>
                        <Text style={styles.dayDetailLabel}>Sessions</Text>
                      </View>
                      <View style={styles.dayDetailStat}>
                        <Ionicons
                          name={
                            selectedDayData.goalAchieved
                              ? "checkmark-circle"
                              : "close-circle-outline"
                          }
                          size={18}
                          color={
                            selectedDayData.goalAchieved
                              ? colors.lima
                              : colors.raven
                          }
                        />
                        <Text style={styles.dayDetailValue}>
                          {selectedDayData.goalAchieved ? "Yes" : "No"}
                        </Text>
                        <Text style={styles.dayDetailLabel}>Goal Met</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.dayDetailEmpty}>
                    No fasting sessions on this day
                  </Text>
                )}
              </View>
            )}

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Fasting Hours</Text>
              <View style={styles.legendRow}>
                {[
                  { label: "<6h", color: `${colors.mainOrange}30` },
                  { label: "6-12h", color: `${colors.mainOrange}55` },
                  { label: "12-16h", color: `${colors.mainOrange}88` },
                  { label: "16-20h", color: `${colors.mainOrange}CC` },
                  { label: "20h+", color: colors.mainOrange },
                ].map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
  },
  tabActive: {
    backgroundColor: `${colors.mainOrange}15`,
  },
  tabText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.raven,
  },
  tabTextActive: {
    color: colors.mainOrange,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  monthTitle: {
    ...typography.h4,
    color: colors.mineShaft,
  },
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
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellSelected: {
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.md,
  },
  dayCellToday: {
    backgroundColor: `${colors.mainBlue}15`,
    borderRadius: borderRadius.md,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.mineShaft,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  dayTextToday: {
    color: colors.mainBlue,
    fontWeight: "700",
  },
  dayDot: {
    position: "absolute",
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayDetail: {
    marginTop: spacing.lg,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  dayDetailDate: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  dayDetailContent: {},
  dayDetailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayDetailStat: {
    alignItems: "center",
    gap: 4,
  },
  dayDetailValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  dayDetailLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  dayDetailEmpty: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: "center",
    fontStyle: "italic",
  },
  legend: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  legendTitle: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.raven,
  },
  legendRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 10,
    color: colors.raven,
  },
});

export default FastingCalendarScreen;
