import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

import { BackButton } from '../../components/atoms';
import { Card, WORKOUT_TYPE_META, WorkoutTypeIcon } from '../../components/molecules';
import {
  useGetWorkoutByIdQuery,
  useCreateUserWorkoutMutation,
  trackingApi,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getCurrentDate } from '../../utils/date';
import { capitalize } from '../../utils/string';

const WorkoutDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { workoutId } = route.params;

  const [confirmVisible, setConfirmVisible] = useState(false);

  const { data: workout, isLoading } = useGetWorkoutByIdQuery(workoutId, { skip: !workoutId });
  const [createUserWorkout, { isLoading: isRecording }] = useCreateUserWorkoutMutation();

  const handleRecordWorkout = useCallback(async () => {
    try {
      await createUserWorkout({
        workoutId: workout._id,
        completedAt: new Date().toISOString(),
        durationMinutes: workout.estimatedDurationMin,
        caloriesBurned: workout.estimatedCaloriesBurned,
        trackingDate: getCurrentDate(),
      }).unwrap();

      dispatch(trackingApi.util.invalidateTags(['Tracking', 'DailyTracking']));
      setConfirmVisible(false);
      Toast.show({ type: 'success', text1: 'Workout Recorded', text2: 'Great job! Keep it up.' });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to record workout.' });
    }
  }, [createUserWorkout, workout, dispatch, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </SafeAreaView>
    );
  }

  if (!workout) return null;

  const meta = WORKOUT_TYPE_META[workout.type] || WORKOUT_TYPE_META.gym;

  const summaryRows = [
    { label: 'Workout', value: workout.name },
    { label: 'Type', value: `${capitalize(workout.type)} · ${capitalize(workout.level)}` },
    { label: 'Duration', value: `${workout.estimatedDurationMin} min` },
    { label: 'Calories burned', value: `${workout.estimatedCaloriesBurned} kcal` },
    { label: 'Date', value: new Date().toLocaleDateString() },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => navigation.goBack()} />

        {/* Hero */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>{workout.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: `${meta.color}15` }]}>
              <WorkoutTypeIcon meta={meta} size={14} color={meta.color} />
              <Text style={[styles.badgeText, { color: meta.color }]}>{capitalize(workout.type)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.lima}15` }]}>
              <Ionicons name="flash-outline" size={14} color={colors.lima} />
              <Text style={[styles.badgeText, { color: colors.lima }]}>{capitalize(workout.level)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.mainBlue}15` }]}>
              <Ionicons name="flag-outline" size={14} color={colors.mainBlue} />
              <Text style={[styles.badgeText, { color: colors.mainBlue }]}>{capitalize(workout.objective)}</Text>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time-outline" size={22} color={colors.mainOrange} />
            </View>
            <Text style={styles.statValue}>{workout.estimatedDurationMin}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="flame-outline" size={22} color={colors.mainOrange} />
            </View>
            <Text style={styles.statValue}>{workout.estimatedCaloriesBurned}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <WorkoutTypeIcon meta={meta} size={22} color={colors.mainOrange} />
            </View>
            <Text style={styles.statValue}>{workout.exercises?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </Card>
        </View>

        {/* Tags */}
        {(workout.muscleGroups?.length > 0 || workout.equipment?.length > 0) && (
          <Card style={styles.tagsCard}>
            {workout.muscleGroups?.length > 0 && (
              <View style={styles.tagGroup}>
                <Text style={styles.tagGroupLabel}>Muscle Groups</Text>
                <View style={styles.tagList}>
                  {workout.muscleGroups.map((g) => (
                    <View key={g} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{capitalize(g).replace('_', ' ')}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {workout.equipment?.length > 0 && (
              <View style={styles.tagGroup}>
                <Text style={styles.tagGroupLabel}>Equipment</Text>
                <View style={styles.tagList}>
                  {workout.equipment.map((e) => (
                    <View key={e} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{capitalize(e)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Exercise Plan */}
        {workout.exercises?.length > 0 && (
          <Card style={styles.exercisesCard}>
            <Text style={styles.exerciseHeading}>Workout Plan</Text>
            {workout.exercises.map((exercise, index) => (
              <View key={exercise} style={styles.step}>
                <View style={styles.stepIndicator}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  {index < workout.exercises.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{exercise}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Record button */}
        <TouchableOpacity style={styles.recordBtn} onPress={() => setConfirmVisible(true)} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
          <Text style={styles.recordBtnText}>Record Workout</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.tabBarPadding }} />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => !isRecording && setConfirmVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, { backgroundColor: `${meta.color}12` }]}>
              <WorkoutTypeIcon meta={meta} size={32} color={meta.color} />
            </View>
            <Text style={styles.modalTitle}>Record this workout?</Text>
            <Text style={styles.modalSubtitle}>The following will be added to your activity log</Text>

            <View style={styles.modalSummary}>
              {summaryRows.map(({ label, value }) => (
                <View key={label} style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>{label}</Text>
                  <Text style={styles.modalRowValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmVisible(false)}
                disabled={isRecording}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleRecordWorkout}
                disabled={isRecording}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.alabaster },
  loadingContainer: { flex: 1, backgroundColor: colors.alabaster, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: spacing.lg },

  heroCard: { marginBottom: spacing.lg },
  heroTitle: { ...typography.h2, color: colors.mineShaft, marginBottom: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  badgeText: { ...typography.bodySmall, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: { ...typography.h3, color: colors.mineShaft },
  statLabel: { ...typography.caption, color: colors.raven, marginTop: 2 },

  tagsCard: { marginBottom: spacing.lg, gap: spacing.md },
  tagGroup: { gap: spacing.sm },
  tagGroupLabel: { ...typography.bodySmall, color: colors.raven, fontWeight: '600' },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  tagChipText: { ...typography.caption, color: colors.mineShaft, fontWeight: '500' },

  exercisesCard: { marginBottom: spacing.lg },
  exerciseHeading: { ...typography.h4, color: colors.mineShaft, marginBottom: spacing.lg },
  step: { flexDirection: 'row', minHeight: 48 },
  stepIndicator: { alignItems: 'center', width: 32, marginRight: spacing.md },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { ...typography.bodySmall, color: colors.white, fontWeight: '700' },
  stepLine: { flex: 1, width: 2, backgroundColor: `${colors.mainOrange}30`, marginVertical: 4 },
  stepContent: { flex: 1, justifyContent: 'center', paddingBottom: spacing.md },
  stepText: { ...typography.body, color: colors.mineShaft },

  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 4,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordBtnText: { ...typography.body, color: colors.white, fontWeight: '700', fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.mineShaft, marginBottom: spacing.xs, textAlign: 'center' },
  modalSubtitle: { ...typography.bodySmall, color: colors.raven, textAlign: 'center', marginBottom: spacing.lg },
  modalSummary: {
    width: '100%',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalRowLabel: { ...typography.bodySmall, color: colors.raven },
  modalRowValue: { ...typography.bodySmall, color: colors.mineShaft, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
    alignItems: 'center',
  },
  modalCancelText: { ...typography.body, color: colors.raven, fontWeight: '600' },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
  },
  modalConfirmText: { ...typography.body, color: colors.white, fontWeight: '700' },
});

export default WorkoutDetailScreen;
