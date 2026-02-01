import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const WorkoutScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>Your personalized fitness plan</Text>
        </View>

        {/* Today's Workout Card */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIconContainer}>
              <Ionicons name="fitness" size={24} color={colors.white} />
            </View>
            <View style={styles.todayInfo}>
              <Text style={styles.todayLabel}>Today's Workout</Text>
              <Text style={styles.todayTitle}>Upper Body Strength</Text>
            </View>
          </View>
          <View style={styles.todayStats}>
            <View style={styles.todayStat}>
              <Ionicons name="time-outline" size={16} color={colors.white} />
              <Text style={styles.todayStatText}>45 min</Text>
            </View>
            <View style={styles.todayStat}>
              <Ionicons name="flame-outline" size={16} color={colors.white} />
              <Text style={styles.todayStatText}>350 cal</Text>
            </View>
            <View style={styles.todayStat}>
              <Ionicons name="barbell-outline" size={16} color={colors.white} />
              <Text style={styles.todayStatText}>8 exercises</Text>
            </View>
          </View>
        </View>

        {/* Workout Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: `${colors.mainOrange}15` }]}>
                <Ionicons name="barbell-outline" size={28} color={colors.mainOrange} />
              </View>
              <Text style={styles.categoryTitle}>Gym</Text>
              <Text style={styles.categorySubtitle}>Strength training</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: `${colors.havelockBlue}15` }]}>
                <Ionicons name="water-outline" size={28} color={colors.havelockBlue} />
              </View>
              <Text style={styles.categoryTitle}>Swimming</Text>
              <Text style={styles.categorySubtitle}>Cardio & endurance</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.progressCard}>
            <View style={styles.weekDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.dayItem}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <View
                    style={[
                      styles.dayCircle,
                      index < 3 && styles.dayCompleted,
                      index === 3 && styles.dayToday,
                    ]}
                  >
                    {index < 3 && (
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>3/5</Text>
                <Text style={styles.progressStatLabel}>Workouts</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>1,050</Text>
                <Text style={styles.progressStatLabel}>Calories</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>2h 15m</Text>
                <Text style={styles.progressStatLabel}>Duration</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.mineShaft,
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    marginTop: 4,
  },
  todayCard: {
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  todayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  todayInfo: {
    flex: 1,
  },
  todayLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  todayTitle: {
    ...typography.h3,
    color: colors.white,
  },
  todayStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  todayStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  todayStatText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  categorySubtitle: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCompleted: {
    backgroundColor: colors.lima,
  },
  dayToday: {
    backgroundColor: colors.mainOrange,
    borderWidth: 2,
    borderColor: colors.mainOrange,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  progressStatLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    backgroundColor: colors.gallery,
  },
});

export default WorkoutScreen;
