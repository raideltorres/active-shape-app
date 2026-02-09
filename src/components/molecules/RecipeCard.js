import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { getNutrientFromNutritionData, getNetCarbsFromNutritionData } from '../../utils/recipes';

const RecipeCard = ({
  id,
  image,
  title,
  readyInMinutes,
  servings,
  summary,
  nutrition,
  isFavorite,
  onFavorite,
  onPress,
}) => {
  const handleFavorite = useCallback(
    (e) => {
      if (onFavorite) onFavorite(id, isFavorite);
    },
    [id, isFavorite, onFavorite],
  );

  const calories = getNutrientFromNutritionData(nutrition, 'Calories');
  const netCarbs = getNetCarbsFromNutritionData(nutrition);
  const fat = getNutrientFromNutritionData(nutrition, 'Fat');
  const ingredientCount = nutrition?.ingredients?.length ?? 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(id)}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={40} color={colors.raven} />
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.mainOrange : colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={colors.raven} />
            <Text style={styles.metaText}>{readyInMinutes} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={18} color={colors.raven} />
            <Text style={styles.metaText}>{ingredientCount} ingr.</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={18} color={colors.raven} />
            <Text style={styles.metaText}>{servings}</Text>
          </View>
        </View>

        <View style={styles.nutritionRow}>
          {calories ? (
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{calories}</Text>
              <Text style={styles.nutritionLabel}>kcal</Text>
            </View>
          ) : null}
          {netCarbs ? (
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{netCarbs}</Text>
              <Text style={styles.nutritionLabel}>net carbs</Text>
            </View>
          ) : null}
          {fat ? (
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{fat}</Text>
              <Text style={styles.nutritionLabel}>fat</Text>
            </View>
          ) : null}
        </View>

        {summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {summary.replace(/<[^>]*>/g, '').trim()}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gallery,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.raven,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mainOrange,
  },
  nutritionLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  summary: {
    ...typography.bodySmall,
    color: colors.raven,
  },
});

export default RecipeCard;
