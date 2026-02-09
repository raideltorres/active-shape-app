import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Category configuration matching web
const CATEGORY_CONFIG = {
  recipeTypes: {
    title: 'RECIPE TYPES',
    icon: 'restaurant-outline',
    color: '#10b981', // green
  },
  emphasizeIngredients: {
    title: 'PRIORITIZE',
    icon: 'checkmark-circle',
    color: '#3b82f6', // blue
  },
  cookingMethods: {
    title: 'COOKING',
    icon: 'flame-outline',
    color: '#8b5cf6', // purple
  },
  supplementSuggestions: {
    title: 'SUPPLEMENTS',
    icon: 'medical-outline',
    color: '#06b6d4', // cyan
  },
  avoidIngredients: {
    title: 'LIMIT',
    icon: 'warning-outline',
    color: '#ef4444', // red
    isWarning: true,
  },
};

// Single category card with tags
const CategoryCard = ({ categoryKey, category }) => {
  // Handle both old format (array) and new format (object with items/reason)
  const items = Array.isArray(category) ? category : category?.items;
  const reason = Array.isArray(category) ? null : category?.reason;

  if (!items || items.length === 0) return null;

  const config = CATEGORY_CONFIG[categoryKey];
  if (!config) return null;

  return (
    <View style={[styles.categoryCard, config.isWarning && styles.categoryCardWarning]}>
      {/* Header */}
      <View style={styles.categoryHeader}>
        <Ionicons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.categoryTitle, { color: config.color }]}>{config.title}</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              config.isWarning && styles.tagWarning,
            ]}
          >
            <Text style={[styles.tagText, config.isWarning && styles.tagTextWarning]}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* Reason */}
      {reason && (
        <Text style={styles.reasonText}>{reason}</Text>
      )}
    </View>
  );
};

/**
 * Personalized Recommendations section for Plan screen
 * Displays recipe types, ingredients to prioritize/avoid, cooking methods, supplements
 */
const RecommendationsSection = ({ recommendations }) => {
  if (!recommendations || typeof recommendations !== 'object') return null;

  const mainCategories = ['recipeTypes', 'emphasizeIngredients', 'cookingMethods', 'supplementSuggestions'];
  const warningCategories = ['avoidIngredients'];

  const hasItems = (category) => {
    if (Array.isArray(category)) return category.length > 0;
    return category?.items?.length > 0;
  };

  const hasMain = mainCategories.some((key) => hasItems(recommendations[key]));
  const hasWarnings = warningCategories.some((key) => hasItems(recommendations[key]));

  if (!hasMain && !hasWarnings) return null;

  return (
    <SectionCard title="Personalized Recommendations" icon="bulb-outline" color={colors.mainOrange}>
      {/* Main categories */}
      {mainCategories.map((key) => (
        <CategoryCard key={key} categoryKey={key} category={recommendations[key]} />
      ))}

      {/* Warning categories (Limit) */}
      {warningCategories.map((key) => (
        <CategoryCard key={key} categoryKey={key} category={recommendations[key]} />
      ))}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  categoryCardWarning: {
    backgroundColor: '#fef3c7', // amber-100
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    ...typography.labelUppercase,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  tagWarning: {
    backgroundColor: colors.white,
    borderColor: '#fcd34d', // amber-300
  },
  tagText: {
    ...typography.caption,
    color: colors.mineShaft,
  },
  tagTextWarning: {
    color: '#92400e', // amber-800
  },
  reasonText: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});

export default RecommendationsSection;
