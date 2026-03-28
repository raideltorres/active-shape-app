import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { Card } from '../../molecules';
import { Button } from '../../atoms';
import { useAnalyzeFoodTextMutation } from '../../../store/api';
import FoodAnalysisResultCard from '../AiFoodScanner/FoodAnalysisResultCard';
import { MEAL_EXAMPLE_INPUTS } from '../../../utils/measure';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const AiFoodTextAnalyzer = ({ userId, onFoodAnalyzed }) => {
  const [description, setDescription] = useState('');
  const [analyzeFoodText, { isLoading }] = useAnalyzeFoodTextMutation();
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState(null);

  const canAnalyze = description.trim().length > 3;
  const analysis = analysisResponse?.analysis;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setError(null);
    try {
      const data = await analyzeFoodText({ userId, description: description.trim() }).unwrap();
      setAnalysisResponse(data);
    } catch (err) {
      if (__DEV__) console.error('Food text analysis error:', err);
      setError(err?.data?.message || 'Analysis failed. Please try again with a clearer description.');
    }
  }, [description, userId, analyzeFoodText, canAnalyze]);

  const handleLogToTracking = useCallback(async () => {
    if (!analysis || !onFoodAnalyzed) return;
    setLogging(true);
    try {
      await onFoodAnalyzed(analysis);
      setAnalysisResponse(null);
      setDescription('');
    } catch (err) {
      if (__DEV__) console.error('Log food error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || 'Failed to log food.' });
    } finally {
      setLogging(false);
    }
  }, [analysis, onFoodAnalyzed]);

  const handleReset = useCallback(() => {
    setAnalysisResponse(null);
    setDescription('');
    setError(null);
  }, []);

  if (analysis && !isLoading) {
    return (
      <FoodAnalysisResultCard
        analysis={analysis}
        onLogToTracking={handleLogToTracking}
        onAnalyzeAnother={handleReset}
        logging={logging}
      />
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="sparkles" size={20} color={colors.mainBlue} />
          <Text style={styles.title}>AI Meal Analyzer</Text>
        </View>
        <Text style={styles.description}>
          Describe what you ate in natural language and our AI will identify the foods and calculate
          the full nutritional breakdown including calories, protein, carbs, and fats.
        </Text>
      </View>

      {!isLoading && (
        <>
          <Text style={styles.inputLabel}>Describe your meal</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. 2 eggs, toast with butter, and orange juice"
            placeholderTextColor={colors.alto}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.examplesLabel}>Examples:</Text>
          <View style={styles.examplesWrap}>
            {MEAL_EXAMPLE_INPUTS.map((example) => (
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
            title="Analyze Meal"
            onPress={handleAnalyze}
            disabled={!canAnalyze || isLoading}
            icon="sparkles"
          />
        </>
      )}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
          <Text style={styles.loadingText}>Analyzing your meal...</Text>
          <Text style={styles.loadingSubtext}>
            AI is identifying foods and calculating nutritional values. This may take a few seconds.
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
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
});

export default AiFoodTextAnalyzer;
