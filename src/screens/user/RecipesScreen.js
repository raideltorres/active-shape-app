import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../../theme';

// Placeholder data - will be replaced with API call
const MOCK_RECIPES = [
  { id: '1', title: 'Grilled Salmon', image: null, calories: 450, readyInMinutes: 25 },
  { id: '2', title: 'Chicken Salad', image: null, calories: 320, readyInMinutes: 15 },
  { id: '3', title: 'Vegetable Stir Fry', image: null, calories: 280, readyInMinutes: 20 },
];

const RecipesScreen = ({ navigation }) => {
  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetails', { id: item.id })}
    >
      <View style={styles.recipeImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderIcon}>🍽️</Text>
        )}
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <View style={styles.recipeMeta}>
          <Text style={styles.recipeMetaText}>🔥 {item.calories} kcal</Text>
          <Text style={styles.recipeMetaText}>⏱️ {item.readyInMinutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipes</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={MOCK_RECIPES}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyText}>No recipes found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.mainOrange,
  },
  title: {
    ...typography.h3,
  },
  placeholder: {
    width: 60,
  },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.gallery,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  recipeInfo: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  recipeTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  recipeMetaText: {
    ...typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.raven,
  },
});

export default RecipesScreen;

