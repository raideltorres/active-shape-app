import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useGetFastingStatsQuery } from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const StatCard = ({ icon, label, value, unit, color = colors.mainBlue }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>
      {value}
      {unit && <Text style={styles.statUnit}> {unit}</Text>}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const FastingStatsScreen = ({ navigation }) => {
  const { data: stats, isLoading, refetch } = useGetFastingStatsQuery();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      </SafeAreaView>
    );
  }

  const totalSessions = stats?.totalSessions || 0;
  const totalHours = Math.round(stats?.totalFastingHours || 0);
  const avgDuration = (stats?.averageDurationHours || 0).toFixed(1);
  const longestFast = (stats?.longestFastHours || 0).toFixed(1);
  const currentStreak = stats?.currentStreak || 0;
  const bestStreak = stats?.bestStreak || 0;
  const completionRate = Math.round(stats?.completionRate || 0);
  const weekSessions = stats?.thisWeek?.sessions || 0;
  const weekHours = (stats?.thisWeek?.totalHours || 0).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fasting Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* This Week */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekRow}>
            <View style={styles.weekStat}>
              <Text style={styles.weekValue}>{weekSessions}</Text>
              <Text style={styles.weekLabel}>Sessions</Text>
            </View>
            <View style={styles.weekDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekValue}>{weekHours}h</Text>
              <Text style={styles.weekLabel}>Total Hours</Text>
            </View>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaks</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="flame"
              label="Current Streak"
              value={currentStreak}
              unit="days"
              color={colors.mainOrange}
            />
            <StatCard
              icon="trophy"
              label="Best Streak"
              value={bestStreak}
              unit="days"
              color={colors.lima}
            />
          </View>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Time</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="timer-outline"
              label="Total Sessions"
              value={totalSessions}
              color={colors.mainBlue}
            />
            <StatCard
              icon="time-outline"
              label="Total Hours"
              value={totalHours}
              unit="h"
              color={colors.purple}
            />
            <StatCard
              icon="speedometer-outline"
              label="Avg Duration"
              value={avgDuration}
              unit="h"
              color={colors.mainOrange}
            />
            <StatCard
              icon="ribbon-outline"
              label="Longest Fast"
              value={longestFast}
              unit="h"
              color={colors.fernFrond}
            />
          </View>
        </View>

        {/* Completion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Completion</Text>
          <View style={styles.completionCard}>
            <View style={styles.completionRing}>
              <Text style={styles.completionValue}>{completionRate}%</Text>
            </View>
            <Text style={styles.completionLabel}>
              You've achieved your fasting goal in {completionRate}% of your sessions
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  weekCard: {
    backgroundColor: colors.mainBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  weekTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  weekLabel: {
    ...typography.caption,
    color: `${colors.white}BB`,
    marginTop: 4,
  },
  weekDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${colors.white}30`,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.mineShaft,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.raven,
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
    textAlign: 'center',
  },
  completionCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  completionRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: colors.lima,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.lima}10`,
  },
  completionValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.lima,
  },
  completionLabel: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FastingStatsScreen;
