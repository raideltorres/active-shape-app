import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { useAnalyzeExerciseMutation } from '../../../store/api';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const INTENSITY_LABELS = {
  low: 'Low Intensity',
  moderate: 'Moderate',
  vigorous: 'Vigorous',
  very_vigorous: 'Very Vigorous',
};

const EXAMPLE_INPUTS = [
  '30 min running at moderate pace',
  '1 hour weight training',
  '45 min cycling + 15 min stretching',
  'Played basketball for 1 hour',
  '20 min HIIT workout',
];

const ExerciseTrackerSection = ({ userWeight, onExerciseAnalyzed, saving }) => {
  const [description, setDescription] = useState('');
  const [analyzeExercise, { data: analysisResponse, isLoading, error }] = useAnalyzeExerciseMutation();
  const [logging, setLogging] = useState(false);

  const canAnalyze = description.trim().length > 3;
  const analysis = analysisResponse?.analysis;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    try {
      await analyzeExercise({ description: description.trim(), userWeight }).unwrap();
    } catch (err) {
      if (__DEV__) console.error('Exercise analysis error:', err);
      Toast.show({ type: 'error', text1: 'Analysis Failed', text2: err?.data?.message || 'Please try again with a clearer description.' });
    }
  }, [description, userWeight, analyzeExercise, canAnalyze]);

  const handleLog = useCallback(async () => {
    if (!analysis) return;
    setLogging(true);
    try {
      await onExerciseAnalyzed?.(analysis);
      setDescription('');
    } catch (err) {
      if (__DEV__) console.error('Log exercise error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || 'Failed to log exercise.' });
    } finally {
      setLogging(false);
    }
  }, [analysis, onExerciseAnalyzed]);

  const handleReset = useCallback(() => {
    setDescription('');
  }, []);

  if (analysis && !isLoading) {
    const { exercises = [], totalCaloriesBurned, totalDuration, suggestions, intensityLevel } = analysis;

    return (
      <View>
        <Card>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeaderIcon}>
              <Ionicons name="fitness" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.resultHeaderTitle}>Exercise Analysis</Text>
              <Text style={styles.resultHeaderSubtitle}>
                {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} detected
              </Text>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={[styles.heroCard, styles.heroCalories]}>
              <Ionicons name="flame" size={20} color={colors.mainOrange} />
              <Text style={styles.heroValue}>{totalCaloriesBurned}</Text>
              <Text style={styles.heroLabel}>kcal burned</Text>
            </View>
            <View style={[styles.heroCard, styles.heroDuration]}>
              <Ionicons name="time" size={20} color={colors.mainBlue} />
              <Text style={styles.heroValue}>{totalDuration}</Text>
              <Text style={styles.heroLabel}>minutes</Text>
            </View>
            <View style={[styles.heroCard, styles.heroIntensity]}>
              <Ionicons name="flash" size={20} color={colors.lima} />
              <Text style={styles.heroValue}>{INTENSITY_LABELS[intensityLevel] || intensityLevel}</Text>
              <Text style={styles.heroLabel}>intensity</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Exercises Breakdown</Text>
          {exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {ex.duration} min · MET {ex.met} · {ex.intensity}
                </Text>
              </View>
              <Text style={styles.exerciseCal}>{ex.caloriesBurned} kcal</Text>
            </View>
          ))}

          {suggestions?.length > 0 && (
            <>
              <View style={styles.tipsHeader}>
                <Ionicons name="sparkles" size={16} color={colors.mainBlue} />
                <Text style={styles.sectionTitle}>Recovery & Tips</Text>
              </View>
              {suggestions.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.raven} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}

          <View style={styles.actions}>
            <Button
              title="Log to Tracking"
              onPress={handleLog}
              disabled={logging}
              icon="checkmark-circle-outline"
              style={styles.logBtn}
            />
            <Button
              title="Analyze Another Exercise"
              onPress={handleReset}
              variant="secondary"
              icon="barbell-outline"
            />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View>
      <Card>
        <View style={styles.headerCenter}>
          <View style={styles.headerRow}>
            <Ionicons name="sparkles" size={20} color={colors.mainBlue} />
            <Text style={styles.title}>AI Exercise Analyzer</Text>
          </View>
          <Text style={styles.description}>
            Describe your exercise session in natural language and our AI will identify the activities, look up the
            correct MET (Metabolic Equivalent) values from the 2024 Compendium of Physical Activities, and calculate
            your calories burned using the scientifically validated formula:{' '}
            <Text style={styles.descBold}>Calories = MET × Weight (kg) × Duration (hours)</Text>. The more specific
            your description (intensity, duration, pace), the more accurate the estimate.
          </Text>
        </View>

        {!isLoading && (
          <>
            <Text style={styles.inputLabel}>Describe your exercise</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. 30 min running at moderate pace"
              placeholderTextColor={colors.alto}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.examplesLabel}>Examples:</Text>
            <View style={styles.examplesWrap}>
              {EXAMPLE_INPUTS.map((example) => (
                <TouchableOpacity
                  key={example}
                  style={styles.chip}
                  onPress={() => setDescription(example)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Analyze Exercise"
              onPress={handleAnalyze}
              disabled={!canAnalyze || isLoading}
              icon="sparkles"
            />
          </>
        )}

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.mainOrange} />
            <Text style={styles.loadingText}>Analyzing your exercise...</Text>
            <Text style={styles.loadingSubtext}>
              AI is identifying exercises, looking up MET values, and calculating calories. This may take a few seconds.
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>
              {error?.data?.message || 'Analysis failed. Please try again.'}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  headerCenter: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: { ...typography.h4, color: colors.mainBlue },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    textAlign: 'justify',
  },
  descBold: { fontWeight: '700' },
  inputLabel: { ...typography.bodySmall, color: colors.raven, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    minHeight: 80,
    marginBottom: spacing.md,
  },
  examplesLabel: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.xs,
  },
  examplesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.mercury,
    backgroundColor: colors.white,
  },
  chipText: { fontSize: 12, color: colors.raven },
  loading: { alignItems: 'center', paddingVertical: spacing.xxl },
  loadingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: 4,
    textAlign: 'center',
  },
  errorWrap: {
    backgroundColor: `${colors.error}12`,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorText: { ...typography.bodySmall, color: colors.error },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resultHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mainBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeaderTitle: { ...typography.h4, color: colors.mineShaft },
  resultHeaderSubtitle: { ...typography.caption, color: colors.raven },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  heroCalories: { backgroundColor: `${colors.mainOrange}14` },
  heroDuration: { backgroundColor: `${colors.mainBlue}14` },
  heroIntensity: { backgroundColor: `${colors.lima}14` },
  heroValue: { ...typography.h4, color: colors.mineShaft, marginTop: 4, textAlign: 'center' },
  heroLabel: { ...typography.caption, color: colors.raven, textAlign: 'center' },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { ...typography.body, color: colors.mineShaft },
  exerciseMeta: { ...typography.caption, color: colors.raven },
  exerciseCal: { ...typography.body, fontWeight: '700', color: colors.mainOrange },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tipText: { ...typography.bodySmall, color: colors.raven, flex: 1 },
  actions: { marginTop: spacing.lg },
  logBtn: { marginBottom: spacing.sm },
});

export default ExerciseTrackerSection;
