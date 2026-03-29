import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
import { capitalize } from '../../utils/string';

export const WORKOUT_TYPE_META = {
  gym: { icon: 'barbell-outline', label: 'Gym', description: 'Weights & machines', color: colors.mainOrange },
  swim: { icon: 'swim', iconSet: 'mci', label: 'Swim', description: 'Pool & open water', color: colors.havelockBlue },
};

export const TypeIcon = ({ meta, size, color }) => {
  if (meta.iconSet === 'mci') {
    return <MaterialCommunityIcons name={meta.icon} size={size} color={color} />;
  }
  return <Ionicons name={meta.icon} size={size} color={color} />;
};

const WorkoutCard = ({ workout, isFavorite, onSelect, onFavorite }) => {
  const meta = WORKOUT_TYPE_META[workout.type] || WORKOUT_TYPE_META.gym;

  return (
    <TouchableOpacity style={styles.card} onPress={onSelect} activeOpacity={0.7}>
      <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite} hitSlop={8}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? colors.mainOrange : colors.alto}
        />
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={2}>{workout.name}</Text>

      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: `${meta.color}12` }]}>
          <TypeIcon meta={meta} size={11} color={meta.color} />
          <Text style={[styles.tagText, { color: meta.color }]}>{capitalize(workout.type)}</Text>
        </View>
        {workout.level && (
          <View style={[styles.tag, { backgroundColor: `${colors.lima}12` }]}>
            <Ionicons name="flash" size={10} color={colors.lima} />
            <Text style={[styles.tagText, { color: colors.lima }]}>{capitalize(workout.level)}</Text>
          </View>
        )}
        {workout.objective && (
          <View style={[styles.tag, { backgroundColor: `${colors.mainBlue}12` }]}>
            <Ionicons name="flag" size={10} color={colors.mainBlue} />
            <Text style={[styles.tagText, { color: colors.mainBlue }]}>{capitalize(workout.objective)}</Text>
          </View>
        )}
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={14} color={colors.raven} />
          <Text style={styles.statValue}>{workout.estimatedDurationMin}</Text>
          <Text style={styles.statUnit}>min</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="flame-outline" size={14} color={colors.raven} />
          <Text style={styles.statValue}>{workout.estimatedCaloriesBurned}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="list-outline" size={14} color={colors.raven} />
          <Text style={styles.statValue}>{workout.exercises?.length ?? 0}</Text>
          <Text style={styles.statUnit}>exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
    position: 'relative',
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    padding: spacing.xs,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.mineShaft,
    marginBottom: spacing.sm,
    paddingRight: spacing.xl,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: borderRadius.sm,
  },
  tagText: { fontSize: 10, fontWeight: '600' },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 14, backgroundColor: colors.gallery },
  statValue: { ...typography.caption, fontWeight: '700', color: colors.mineShaft },
  statUnit: { ...typography.caption, color: colors.raven, fontSize: 10 },
});

export default WorkoutCard;
