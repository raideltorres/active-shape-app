import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

import { useCreateTrackingMutation } from '../store/api';

export const useFoodLog = (userId, selectedDate) => {
  const [createTracking, { isLoading: isSaving }] = useCreateTrackingMutation();

  const logFood = useCallback(
    async (analysis) => {
      if (!analysis?.totalNutrition || !userId) return;
      const { totalNutrition } = analysis;
      try {
        await Promise.all([
          createTracking({ userId, date: selectedDate, field: 'caloriesConsumed', value: totalNutrition.calories ?? 0 }).unwrap(),
          createTracking({ userId, date: selectedDate, field: 'proteins', value: totalNutrition.proteins ?? 0 }).unwrap(),
          createTracking({ userId, date: selectedDate, field: 'carbs', value: totalNutrition.carbs ?? 0 }).unwrap(),
          createTracking({ userId, date: selectedDate, field: 'fats', value: totalNutrition.fats ?? 0 }).unwrap(),
        ]);
        Toast.show({ type: 'success', text1: 'Food Logged', text2: `Added ${totalNutrition.calories ?? 0} kcal and macros to your daily tracking.` });
      } catch (e) {
        if (__DEV__) console.error('Log food error:', e);
        Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to log food. Please try again.' });
      }
    },
    [userId, selectedDate, createTracking],
  );

  return { logFood, isSaving };
};
