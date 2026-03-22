import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

import { useCreateTrackingMutation } from '../store/api';

export const useExerciseLog = (userId, selectedDate) => {
  const [createTracking, { isLoading: isSaving }] = useCreateTrackingMutation();

  const logExercise = useCallback(
    async (analysis) => {
      if (!analysis || !userId) return;
      const { totalCaloriesBurned = 0, totalDuration = 0, estimatedSteps = 0 } = analysis;
      try {
        await Promise.all([
          totalCaloriesBurned > 0 && createTracking({ userId, date: selectedDate, field: 'caloriesBurned', value: totalCaloriesBurned }).unwrap(),
          totalDuration > 0 && createTracking({ userId, date: selectedDate, field: 'exerciseDuration', value: totalDuration }).unwrap(),
          estimatedSteps > 0 && createTracking({ userId, date: selectedDate, field: 'steps', value: estimatedSteps }).unwrap(),
        ].filter(Boolean));
        const stepsSuffix = estimatedSteps > 0 ? ` and ~${estimatedSteps.toLocaleString()} steps` : '';
        Toast.show({ type: 'success', text1: 'Exercise Logged', text2: `${totalCaloriesBurned} kcal burned · ${totalDuration} min${stepsSuffix}` });
      } catch (e) {
        if (__DEV__) console.error('Log exercise error:', e);
        Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to log exercise.' });
      }
    },
    [userId, selectedDate, createTracking],
  );

  return { logExercise, isSaving };
};
