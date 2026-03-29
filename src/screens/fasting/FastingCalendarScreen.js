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
import Toast from "react-native-toast-message";

import {
  useGetFastingCalendarQuery,
  useGetFastingHistoryQuery,
  useDeleteFastingSessionMutation,
} from "../../store/api";
import { getMonthRange } from "../../utils/fasting";
import { MONTHS } from "../../utils/date";
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { colors, spacing, typography, borderRadius } from "../../theme";
import FastingCalendarGrid from "./FastingCalendarGrid";
import FastingSessionList from "./FastingSessionList";

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
      <ScreenHeader title="Fasting Calendar" />

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
            <FastingCalendarGrid
              calendarDays={calendarDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              today={today}
              month={month}
              year={year}
            />
            <FastingSessionList
              selectedDate={selectedDate}
              selectedDayData={selectedDayData}
              sessions={selectedDaySessions}
              onDeleteSession={handleDeleteSession}
            />
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
});

export default FastingCalendarScreen;
