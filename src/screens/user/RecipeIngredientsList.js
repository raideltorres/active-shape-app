import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const getIngredientImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `https://spoonacular.com/cdn/ingredients_100x100/${image}`;
};

const RecipeIngredientsList = ({ ingredients, checkedIngredients, onToggleIngredient }) => {
  if (!ingredients?.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.map((ingredient, index) => {
        const checked = checkedIngredients.has(index);
        return (
          <TouchableOpacity
            key={index}
            style={[styles.ingredientRow, checked && styles.ingredientRowChecked]}
            onPress={() => onToggleIngredient(index)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            {ingredient.image ? (
              <Image
                source={{ uri: getIngredientImageUrl(ingredient.image) }}
                style={styles.ingredientImage}
              />
            ) : null}
            <View style={styles.ingredientInfo}>
              <Text style={[styles.ingredientName, checked && styles.ingredientNameChecked]}>
                {ingredient.name}
              </Text>
              <Text style={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  ingredientRowChecked: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.alto,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.mainOrange,
    borderColor: colors.mainOrange,
  },
  ingredientImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: spacing.md,
    backgroundColor: colors.gallery,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...typography.body,
  },
  ingredientNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.raven,
  },
  ingredientAmount: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
  },
});

export default RecipeIngredientsList;
