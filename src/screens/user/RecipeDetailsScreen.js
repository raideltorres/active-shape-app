import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/atoms/Button';
import { colors, spacing, typography, borderRadius } from '../../theme';

const RecipeDetailsScreen = ({ navigation, route }) => {
  const { id } = route.params;

  // Placeholder data - will be replaced with API call
  const recipe = {
    id,
    title: 'Grilled Salmon with Vegetables',
    readyInMinutes: 25,
    servings: 2,
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 25,
    ingredients: [
      { name: 'Salmon fillet', amount: '200g' },
      { name: 'Olive oil', amount: '2 tbsp' },
      { name: 'Lemon', amount: '1' },
      { name: 'Garlic', amount: '2 cloves' },
    ],
    instructions: [
      'Preheat grill to medium-high heat',
      'Season salmon with salt, pepper, and olive oil',
      'Grill for 4-5 minutes per side',
      'Serve with lemon wedges',
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroImage}>
            <Text style={styles.heroIcon}>🐟</Text>
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.readyInMinutes}</Text>
              <Text style={styles.metaLabel}>min</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
              <Text style={styles.metaLabel}>servings</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.calories}</Text>
              <Text style={styles.metaLabel}>kcal</Text>
            </View>
          </View>
        </View>

        <View style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>Nutrition per serving</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.checkbox} />
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Button title="Log This Meal" onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    ...typography.body,
    color: colors.mainOrange,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gallery,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    fontSize: 48,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xxl,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaValue: {
    ...typography.h3,
    color: colors.mainOrange,
  },
  metaLabel: {
    ...typography.caption,
  },
  nutritionCard: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...typography.h3,
    color: colors.mainOrange,
  },
  nutritionLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.alto,
    marginRight: spacing.md,
  },
  ingredientName: {
    ...typography.body,
    flex: 1,
  },
  ingredientAmount: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  stepText: {
    ...typography.body,
    flex: 1,
    paddingTop: spacing.xs,
  },
});

export default RecipeDetailsScreen;

