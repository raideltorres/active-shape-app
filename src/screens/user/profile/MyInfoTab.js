import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useGetProfileQuery, useGetAllConstantsQuery } from '../../../store/api';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import {
  BODY_COMP_DISPLAY_LABELS,
  DAILY_ACTIVITY_LABELS,
  EXERCISE_FREQUENCY_LABELS,
  TIMELINE_LABELS,
  INJURY_LABELS,
  getDietLabel,
} from '../../../utils/measure';

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const InfoRow = ({ label, value, badge }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueRow}>
      <Text style={styles.infoValue}>{value || 'Not Set'}</Text>
      {badge && <Text style={styles.badge}>{badge}</Text>}
    </View>
  </View>
);

const MyInfoTab = ({ navigation }) => {
  const { data: profile } = useGetProfileQuery();
  const { data: constantsData } = useGetAllConstantsQuery();

  const displayName = profile?.name || 'User';
  const displayEmail = profile?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const age = useMemo(() => {
    if (!profile?.birthDate) return null;
    const birth = new Date(profile.birthDate);
    const now = new Date();
    let a = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) a--;
    return a;
  }, [profile?.birthDate]);

  const resolvedPrimaryGoal = useMemo(() => {
    const goalCode = profile?.onboarding?.healthAndFitnessGoals?.primaryGoal;
    if (!goalCode || !constantsData?.primaryGoals) return null;
    const match = constantsData.primaryGoals.find((g) => g.value === goalCode);
    return match?.text || goalCode;
  }, [profile, constantsData]);

  const dietaryPref = profile?.onboarding?.healthAndFitnessGoals?.dietaryPreference;
  const goalTimeline = profile?.onboarding?.healthAndFitnessGoals?.goalTimeline;
  const dailyActivity = profile?.onboarding?.currentLifestyleAndHabits?.dailyActivityLevel;
  const dailyActivityLabel = dailyActivity != null ? DAILY_ACTIVITY_LABELS[dailyActivity] : null;
  const exerciseFreq = profile?.onboarding?.currentLifestyleAndHabits?.exerciseFrequency;
  const exerciseFreqLabel = exerciseFreq != null ? EXERCISE_FREQUENCY_LABELS[exerciseFreq] : null;
  const injuries = profile?.onboarding?.healthInformation?.injuries || [];
  const injuriesOther = profile?.onboarding?.healthInformation?.injuriesOther;
  const injuriesDisplay = [...injuries.map((i) => INJURY_LABELS[i] || i), injuriesOther].filter(Boolean);

  const workoutStats = profile?.workoutSettings?.workoutStats;
  const hasWorkoutStats = workoutStats && (workoutStats.totalWorkoutsCompleted > 0 || workoutStats.currentStreak > 0);

  return (
    <>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color={colors.mainOrange} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          {profile?.gender && (
            <InfoRow label="Gender" value={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} />
          )}
          {age !== null && <InfoRow label="Age" value={`${age} Years`} />}
          {profile?.height && <InfoRow label="Height" value={`${profile.height} Cm`} />}
          {profile?.weight && <InfoRow label="Current Weight" value={`${profile.weight} Kg`} />}
          {profile?.bodyComposition && (
            <InfoRow label="Body Composition" value={BODY_COMP_DISPLAY_LABELS[profile.bodyComposition] || profile.bodyComposition} />
          )}
          {profile?.bmi && (
            <InfoRow label="BMI" value={profile.bmi.adjusted?.toFixed(1)} badge={profile.bmi.category} />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals & Preferences</Text>
        <View style={styles.infoCard}>
          {resolvedPrimaryGoal && <InfoRow label="Primary Goal" value={resolvedPrimaryGoal} />}
          <InfoRow label="Goal Weight" value={profile?.goalWeight ? `${profile.goalWeight} Kg` : null} />
          {goalTimeline && <InfoRow label="Timeline" value={TIMELINE_LABELS[goalTimeline] || goalTimeline} />}
          <InfoRow label="Daily Routine" value={dailyActivityLabel} />
          <InfoRow label="Exercise Frequency" value={exerciseFreqLabel} />
          {dietaryPref && dietaryPref !== 'none' && (
            <InfoRow label="Dietary Preference" value={getDietLabel(dietaryPref)} />
          )}
          {injuriesDisplay.length > 0 && (
            <InfoRow label="Injuries / Limitations" value={injuriesDisplay.join(', ')} />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Member Since" value={formatDate(profile?.createdAt)} />
        </View>
      </View>

      {hasWorkoutStats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.totalWorkoutsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(workoutStats.totalCaloriesBurned || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Kcal Burned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.bestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, color: colors.white, fontWeight: '700' },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  userName: { ...typography.h4, color: colors.mineShaft },
  userEmail: { ...typography.bodySmall, color: colors.raven, marginTop: 2 },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.alabaster,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.caption,
    color: colors.raven,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  infoLabel: { ...typography.bodySmall, color: colors.raven },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoValue: { ...typography.body, color: colors.mineShaft, fontWeight: '600' },
  badge: { ...typography.caption, color: colors.mainOrange, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.mainOrange },
  statLabel: { ...typography.caption, color: colors.raven, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.gallery },
});

export default MyInfoTab;
