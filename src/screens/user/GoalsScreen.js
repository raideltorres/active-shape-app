import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const GoalsScreen = ({ navigation }) => {
  const goals = [
    {
      title: 'Weight Goal',
      current: '82 kg',
      target: '75 kg',
      progress: 40,
      icon: 'scale-outline',
      color: colors.purple,
    },
    {
      title: 'Daily Calories',
      current: '1,850',
      target: '2,000 kcal',
      progress: 92,
      icon: 'flame-outline',
      color: colors.mainOrange,
    },
    {
      title: 'Weekly Workouts',
      current: '3',
      target: '5 sessions',
      progress: 60,
      icon: 'barbell-outline',
      color: colors.lima,
    },
    {
      title: 'Daily Water',
      current: '2.1L',
      target: '2.5L',
      progress: 84,
      icon: 'water-outline',
      color: colors.havelockBlue,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
          </TouchableOpacity>
          <Text style={styles.title}>My Goals</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={colors.mainOrange} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="trophy" size={28} color={colors.white} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Great Progress!</Text>
              <Text style={styles.summarySubtitle}>
                You're on track with 3 out of 4 goals
              </Text>
            </View>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {goals.map((goal, index) => (
            <View key={index} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View
                  style={[
                    styles.goalIconContainer,
                    { backgroundColor: `${goal.color}15` },
                  ]}
                >
                  <Ionicons name={goal.icon} size={22} color={goal.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalTarget}>Target: {goal.target}</Text>
                </View>
                <Text style={[styles.goalCurrent, { color: goal.color }]}>
                  {goal.current}
                </Text>
              </View>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      { width: `${goal.progress}%`, backgroundColor: goal.color },
                    ]}
                  />
                </View>
                <Text style={styles.goalProgressText}>{goal.progress}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={32} color={colors.mainOrange} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakValue}>12 Day Streak!</Text>
            <Text style={styles.streakLabel}>Keep going to maintain your streak</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: colors.lima,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.white,
  },
  summarySubtitle: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  goalTarget: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  goalCurrent: {
    ...typography.h3,
    fontWeight: '700',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gallery,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressText: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});

export default GoalsScreen;
