import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CardHeader from './CardHeader';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const WeeklySummaryCard = ({ trackingData = [] }) => {
  // Calculate weekly data from tracking records
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Get Monday of current week
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    let totalCalories = 0;
    let totalWater = 0;
    let trackedDays = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const dayRecord = trackingData?.find(t => t.date === dateStr);
      const hasData = dayRecord && (dayRecord.caloriesConsumed > 0 || dayRecord.water > 0);
      
      if (hasData) {
        totalCalories += dayRecord.caloriesConsumed || 0;
        totalWater += dayRecord.water || dayRecord.waterConsumed || 0;
        trackedDays++;
      }

      weekDays.push({
        date: dateStr,
        completed: hasData,
        calories: dayRecord?.caloriesConsumed || 0,
      });
    }

    const avgCalories = trackedDays > 0 ? Math.round(totalCalories / trackedDays) : 0;
    const avgWater = trackedDays > 0 ? (totalWater / trackedDays / 1000).toFixed(1) : 0;
    const onTrackPercent = trackedDays > 0 ? Math.round((trackedDays / 7) * 100) : 0;

    return {
      weekDays,
      trackedDays,
      avgCalories,
      avgWater,
      onTrackPercent,
    };
  }, [trackingData]);

  const todayIndex = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }, []);

  return (
    <View style={styles.container}>
      <CardHeader
        icon="calendar-outline"
        iconColor={colors.havelockBlue}
        title="Weekly Summary"
        subtitle={`${weeklyStats.trackedDays}/7 days tracked`}
        style={{ marginBottom: spacing.lg }}
      />

      <View style={styles.daysContainer}>
        {DAYS.map((day, index) => {
          const dayData = weeklyStats.weekDays[index];
          const isToday = index === todayIndex;
          const isCompleted = dayData?.completed;
          const isPast = index < todayIndex;

          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
              <View
                style={[
                  styles.dayCircle,
                  isCompleted && styles.dayCircleCompleted,
                  isToday && !isCompleted && styles.dayCircleToday,
                  isPast && !isCompleted && styles.dayCircleMissed,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : isToday ? (
                  <View style={styles.todayDot} />
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color={colors.mainOrange} />
          <Text style={styles.statValue}>
            {weeklyStats.avgCalories > 0 ? weeklyStats.avgCalories.toLocaleString() : '--'}
          </Text>
          <Text style={styles.statLabel}>kcal avg</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="water" size={16} color={colors.havelockBlue} />
          <Text style={styles.statValue}>
            {weeklyStats.avgWater > 0 ? `${weeklyStats.avgWater}L` : '--'}
          </Text>
          <Text style={styles.statLabel}>water avg</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={16} color={colors.lima} />
          <Text style={styles.statValue}>
            {weeklyStats.onTrackPercent > 0 ? `${weeklyStats.onTrackPercent}%` : '--'}
          </Text>
          <Text style={styles.statLabel}>on track</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: colors.lima,
  },
  dayCircleToday: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.mainOrange,
  },
  dayCircleMissed: {
    backgroundColor: `${colors.cinnabar}20`,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mainOrange,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.gallery,
  },
  statValue: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
    fontSize: 10,
  },
});

export default WeeklySummaryCard;
