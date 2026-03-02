import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { capitalize } from '../../utils/string';

const MEAL_TYPE_ICONS = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

const MealLogCard = ({ meal, onDelete }) => {
  const icon = MEAL_TYPE_ICONS[meal.mealType] || 'restaurant-outline';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={20} color={colors.raven} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{meal.title}</Text>
          <View style={styles.meta}>
            <Ionicons name={icon} size={14} color={colors.mainOrange} />
            <Text style={styles.metaText}>{capitalize(meal.mealType)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{meal.servingsConsumed} serving{meal.servingsConsumed !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.raven} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.nutritionRow}>
        <NutriStat label="Cal" value={Math.round(meal.nutrition?.calories || 0)} />
        <NutriStat label="Protein" value={`${Math.round(meal.nutrition?.protein || 0)}g`} />
        <NutriStat label="Carbs" value={`${Math.round(meal.nutrition?.netCarbs || 0)}g`} />
        <NutriStat label="Fat" value={`${Math.round(meal.nutrition?.fat || 0)}g`} />
      </View>
    </View>
  );
};

const NutriStat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.gallery,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.raven,
  },
  metaDot: {
    ...typography.caption,
    color: colors.alto,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.mainOrange,
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 1,
  },
});

export default MealLogCard;
