import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { OptionPicker } from '../atoms';
import { useLogMealFromRecipeMutation } from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getCurrentDate } from '../../utils/date';

const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', text: 'Breakfast' },
  { value: 'lunch', text: 'Lunch' },
  { value: 'dinner', text: 'Dinner' },
  { value: 'snack', text: 'Snack' },
];

const NUTRITION_ITEMS = [
  { key: 'calories', label: 'kcal', icon: 'flame-outline' },
  { key: 'protein', label: 'Protein', icon: 'nutrition-outline', suffix: 'g' },
  { key: 'netCarbs', label: 'Carbs', icon: 'leaf-outline', suffix: 'g' },
  { key: 'fat', label: 'Fat', icon: 'water-outline', suffix: 'g' },
];

const LogMealModal = ({ visible, onClose, recipe, nutrition }) => {
  const [mealType, setMealType] = useState('lunch');
  const [servings, setServings] = useState(1);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [logMeal, { isLoading }] = useLogMealFromRecipeMutation();

  useEffect(() => {
    if (visible) {
      setMealType('lunch');
      setServings(1);
      setConfirmVisible(false);
    }
  }, [visible]);

  const maxServings = recipe?.servings || 1;

  const calculated = {
    calories: Math.round((nutrition?.calories?.amount || 0) * servings),
    protein: Math.round((nutrition?.protein?.amount || 0) * servings),
    netCarbs: Math.round((nutrition?.netCarbs?.amount || 0) * servings),
    fat: Math.round((nutrition?.fat?.amount || 0) * servings),
  };

  const mealTypeLabel = MEAL_TYPE_OPTIONS.find((o) => o.value === mealType)?.text || mealType;

  const handleProceed = useCallback(() => setConfirmVisible(true), []);

  const handleConfirm = useCallback(async () => {
    if (!recipe || !nutrition) return;
    try {
      await logMeal({
        recipeId: String(recipe.id),
        title: recipe.title,
        image: recipe.image,
        servings: recipe.servings,
        readyInMinutes: recipe.readyInMinutes,
        servingsConsumed: servings,
        mealType,
        date: getCurrentDate(),
        nutrition: {
          calories: nutrition.calories?.amount || 0,
          protein: nutrition.protein?.amount || 0,
          netCarbs: nutrition.netCarbs?.amount || 0,
          fat: nutrition.fat?.amount || 0,
          fiber: nutrition.fiber?.amount,
          sugar: nutrition.sugar?.amount,
          sodium: nutrition.sodium?.amount,
          saturatedFat: nutrition.saturatedFat?.amount,
        },
      }).unwrap();

      Toast.show({ type: 'success', text1: 'Meal Logged', text2: 'Added to your daily tracking.' });
      setConfirmVisible(false);
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log meal.' });
    }
  }, [recipe, nutrition, servings, mealType, logMeal, onClose]);

  if (!recipe || !nutrition) return null;

  return (
    <>
      {/* Step 1: Meal config */}
      <Modal visible={visible && !confirmVisible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />

            <Text style={styles.title}>Log Meal</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{recipe.title}</Text>

            {/* Meal type */}
            <Text style={styles.label}>Meal type</Text>
            <OptionPicker options={MEAL_TYPE_OPTIONS} value={mealType} onChange={setMealType} />

            {/* Servings */}
            <Text style={[styles.label, { marginTop: spacing.lg }]}>Servings</Text>
            <View style={styles.servingsRow}>
              <TouchableOpacity
                style={[styles.servingsBtn, servings <= 1 && styles.servingsBtnDisabled]}
                onPress={() => setServings((s) => Math.max(1, s - 1))}
                disabled={servings <= 1}
              >
                <Ionicons name="remove" size={20} color={servings <= 1 ? colors.alto : colors.mainOrange} />
              </TouchableOpacity>
              <Text style={styles.servingsValue}>{servings}</Text>
              <TouchableOpacity
                style={[styles.servingsBtn, servings >= maxServings && styles.servingsBtnDisabled]}
                onPress={() => setServings((s) => Math.min(maxServings, s + 1))}
                disabled={servings >= maxServings}
              >
                <Ionicons name="add" size={20} color={servings >= maxServings ? colors.alto : colors.mainOrange} />
              </TouchableOpacity>
              <Text style={styles.servingsTotal}>of {maxServings}</Text>
            </View>

            {/* Nutrition preview */}
            <Text style={[styles.label, { marginTop: spacing.lg }]}>Nutrition to log</Text>
            <View style={styles.nutritionGrid}>
              {NUTRITION_ITEMS.map(({ key, label, icon, suffix }) => (
                <View key={key} style={styles.nutritionItem}>
                  <View style={styles.nutritionIcon}>
                    <Ionicons name={icon} size={18} color={colors.mainOrange} />
                  </View>
                  <Text style={styles.nutritionValue}>
                    {calculated[key]}{suffix || ''}
                  </Text>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logBtn} onPress={handleProceed} activeOpacity={0.8}>
                <Ionicons name="restaurant-outline" size={18} color={colors.white} />
                <Text style={styles.logBtnText}>Log Meal</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Step 2: Confirmation */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => !isLoading && setConfirmVisible(false)}>
          <Pressable style={styles.confirmSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="restaurant-outline" size={28} color={colors.mainOrange} />
            </View>
            <Text style={styles.confirmTitle}>Log this meal?</Text>
            <Text style={styles.confirmText}>
              Log {servings} serving{servings !== 1 ? 's' : ''} of{' '}
              <Text style={styles.confirmDishName}>{recipe.title}</Text>
              {' '}as {mealTypeLabel}.
            </Text>
            <Text style={styles.confirmCalories}>
              This will add {calculated.calories} calories to your daily tracking.
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmVisible(false)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logBtn}
                onPress={handleConfirm}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.logBtnText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.alto,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  servingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.mainOrange}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsBtnDisabled: {
    backgroundColor: colors.athensGray,
  },
  servingsValue: {
    ...typography.h3,
    color: colors.mineShaft,
    minWidth: 28,
    textAlign: 'center',
  },
  servingsTotal: {
    ...typography.bodySmall,
    color: colors.raven,
  },

  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  nutritionValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.mineShaft,
  },
  nutritionLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.body,
    color: colors.raven,
    fontWeight: '600',
  },
  logBtn: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },

  confirmSheet: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    ...typography.h3,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmDishName: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
  confirmCalories: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default LogMealModal;
