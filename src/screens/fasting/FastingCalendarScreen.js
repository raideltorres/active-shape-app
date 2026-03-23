import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

import {
  useGetFastingCalendarQuery,
  useGetFastingHistoryQuery,
  useDeleteFastingSessionMutation,
} from "../../store/api";
import { FASTING_STAGES, getCurrentStage } from "../../constants/fasting";
import { getMonthRange, secondsToShortTime } from "../../utils/fasting";
import { colors, spacing, typography, borderRadius } from "../../theme";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
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
  const rawDay = new Date(year, month, 1).getDay();
  const firstDayOfWeek = (rawDay + 6) % 7;

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

  const { data: monthSessions } = useGetFastingHistoryQuery({
    startDate,
    endDate,
    limit: 100,
  });

  const [deleteSession] = useDeleteFastingSessionMutation();

  const selectedDayData = selectedDate ? calendarMap[selectedDate] : null;

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate || !monthSessions?.sessions?.length) return [];
    const dayStart = new Date(selectedDate + "T00:00:00").getTime();
    const dayEnd = dayStart + 86400000;
    return monthSessions.sessions.filter((s) => {
      const sStart = new Date(s.startTime).getTime();
      const sEnd = s.endTime ? new Date(s.endTime).getTime() : Date.now();
      return sStart < dayEnd && sEnd > dayStart;
    });
  }, [selectedDate, monthSessions]);

  const handleDeleteSession = useCallback(
    (sessionId) => {
      Alert.alert(
        "Delete Session",
        "Are you sure you want to delete this fasting session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteSession(sessionId).unwrap();
              } catch {
                Toast.show({ type: "error", text1: "Failed to delete session" });
              }
            },
          },
        ],
      );
    },
    [deleteSession],
  );

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
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth} hitSlop={8}>
            <Ionicons name="chevron-back" size={14} color={colors.mineShaft} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth} hitSlop={8}>
            <Ionicons name="chevron-forward" size={14} color={colors.mineShaft} />
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
                    onPress={() => setSelectedDate(item.date)}
                    activeOpacity={0.7}
                  >
                    {hasFasting ? (
                      <LinearGradient
                        colors={["#667eea", "#764ba2"]}
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

            {/* Selected day detail + sessions */}
            {selectedDate && (
              <View style={styles.dayDetailWrap}>
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
                  <View style={styles.dayDetailSummary}>
                    <View style={styles.dayDetailRow}>
                      <View style={styles.dayDetailStat}>
                        <Ionicons name="timer-outline" size={18} color={colors.mainBlue} />
                        <Text style={styles.dayDetailValue}>
                          {(selectedDayData.totalHours || 0).toFixed(1)}h
                        </Text>
                        <Text style={styles.dayDetailLabel}>Total</Text>
                      </View>
                      <View style={styles.dayDetailStat}>
                        <Ionicons name="list-outline" size={18} color={colors.mainOrange} />
                        <Text style={styles.dayDetailValue}>
                          {selectedDayData.sessionCount || 0}
                        </Text>
                        <Text style={styles.dayDetailLabel}>Sessions</Text>
                      </View>
                      <View style={styles.dayDetailStat}>
                        <Ionicons
                          name={selectedDayData.goalAchieved ? "checkmark-circle" : "close-circle-outline"}
                          size={18}
                          color={selectedDayData.goalAchieved ? colors.lima : colors.raven}
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

                {selectedDaySessions.length > 0 && (
                  <View style={styles.sessionList}>
                    <Text style={styles.sessionListTitle}>Sessions</Text>
                    {selectedDaySessions.map((session) => {
                      const durationSeconds = session.actualDurationSeconds || 0;
                      const stage = getCurrentStage(durationSeconds);
                      const startDate = new Date(session.startTime);
                      const dateStr = startDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                      const timeStr = startDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      return (
                        <View key={session._id} style={styles.sessionCard}>
                          <View style={styles.sessionHeader}>
                            <View>
                              <Text style={styles.sessionPlan}>
                                {session.fastingPlanTitle || "Custom Fast"}
                              </Text>
                              <Text style={styles.sessionTime}>
                                {dateStr}, {timeStr}
                                {session.endTime
                                  ? ` → ${new Date(session.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                                  : " → Ongoing"}
                              </Text>
                            </View>
                            <View style={styles.sessionActions}>
                              {session.goalAchieved && (
                                <View style={styles.goalBadge}>
                                  <Ionicons name="checkmark-circle" size={14} color={colors.lima} />
                                </View>
                              )}
                              <TouchableOpacity onPress={() => handleDeleteSession(session._id)} hitSlop={8}>
                                <Ionicons name="trash-outline" size={16} color={colors.raven} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.sessionBody}>
                            <View style={[styles.stageIndicator, { backgroundColor: `${stage.color}20` }]}>
                              <Ionicons name={stage.icon} size={18} color={stage.color} />
                            </View>
                            <View style={styles.sessionDetails}>
                              <Text style={styles.sessionDuration}>{secondsToShortTime(durationSeconds)}</Text>
                              <Text style={[styles.sessionStageText, { color: stage.color }]}>{stage.label}</Text>
                            </View>
                          </View>

                          {(() => {
                            const matched = session.stagesReached?.length
                              ? FASTING_STAGES.filter((s) => session.stagesReached.includes(s.label))
                              : [];
                            if (!matched.length) return null;
                            return (
                              <View style={styles.stagesRow}>
                                {matched.map((s) => (
                                  <View key={s.label} style={[styles.stageChip, { backgroundColor: `${s.color}15` }]}>
                                    <View style={[styles.stageChipDot, { backgroundColor: s.color }]} />
                                    <Text style={[styles.stageChipText, { color: s.color }]}>{s.label}</Text>
                                  </View>
                                ))}
                              </View>
                            );
                          })()}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
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
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gallery,
    alignItems: "center",
    justifyContent: "center",
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
  dayDetailWrap: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  dayDetailDate: {
    ...typography.h4,
    color: colors.mineShaft,
    textAlign: "center",
  },
  dayDetailSummary: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
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

  sessionList: {
    gap: spacing.sm,
  },
  sessionListTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.mineShaft,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gallery,
    gap: spacing.sm,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionPlan: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.mineShaft,
  },
  sessionTime: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${colors.lima}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stageIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDuration: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  sessionStageText: {
    ...typography.caption,
    fontWeight: "600",
  },
  stagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  stageChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  stageChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageChipText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default FastingCalendarScreen;
