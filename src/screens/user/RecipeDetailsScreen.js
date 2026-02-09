import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { recipesService, userService } from '../../services/api';
import Button from '../../components/atoms/Button';
import { colors, spacing, typography, borderRadius } from '../../theme';

const stripLinks = (html) => {
  if (!html) return '';
  return html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
};

const getIngredientImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `https://spoonacular.com/cdn/ingredients_100x100/${image}`;
};

const getEquipmentImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `https://spoonacular.com/cdn/equipment_100x100/${image}`;
};

const getNutrient = (nutrition, name) => {
  if (!nutrition?.nutrients) return null;
  const nutrient = nutrition.nutrients.find((n) => n.name === name);
  return nutrient ? { amount: Math.round(nutrient.amount), unit: nutrient.unit } : null;
};

const getNetCarbs = (nutrition) => {
  if (!nutrition?.nutrients) return null;
  const netCarbs = nutrition.nutrients.find((n) => n.name === 'Net Carbohydrates');
  if (netCarbs) return { amount: Math.round(netCarbs.amount), unit: netCarbs.unit };
  const totalCarbs = nutrition.nutrients.find((n) => n.name === 'Carbohydrates');
  const fiber = nutrition.nutrients.find((n) => n.name === 'Fiber');
  if (totalCarbs) {
    return {
      amount: Math.round(totalCarbs.amount - (fiber?.amount || 0)),
      unit: totalCarbs.unit,
    };
  }
  return null;
};

const RecipeDetailsScreen = ({ navigation, route }) => {
  const { id, isFavorite: initialFavorite } = route.params || {};
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('No recipe ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await recipesService.getRecipeDetails(id);
      setRecipe(data);
      // isFavorite would come from profile; for details we don't have it in response, could fetch profile or leave as false
    } catch (err) {
      setError(err.message || 'Failed to load recipe');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchRecipe();
    }, [fetchRecipe]),
  );

  // Sync favorite state when navigating to a different recipe (e.g. from list)
  React.useEffect(() => {
    if (route.params?.isFavorite !== undefined) {
      setIsFavorite(Boolean(route.params.isFavorite));
    }
  }, [route.params?.id, route.params?.isFavorite]);

  const nutrition = useMemo(() => {
    if (!recipe?.nutrition) return null;
    return {
      calories: getNutrient(recipe.nutrition, 'Calories'),
      protein: getNutrient(recipe.nutrition, 'Protein'),
      netCarbs: getNetCarbs(recipe.nutrition),
      fat: getNutrient(recipe.nutrition, 'Fat'),
      fiber: getNutrient(recipe.nutrition, 'Fiber'),
      sugar: getNutrient(recipe.nutrition, 'Sugar'),
      sodium: getNutrient(recipe.nutrition, 'Sodium'),
      saturatedFat: getNutrient(recipe.nutrition, 'Saturated Fat'),
    };
  }, [recipe]);

  const toggleStep = useCallback((stepNumber) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  }, []);

  const toggleIngredient = useCallback((index) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleFavorite = useCallback(async () => {
    try {
      if (isFavorite) {
        await userService.removeRecipeFavorite(String(id));
        setIsFavorite(false);
      } else {
        await userService.addRecipeFavorite(String(id));
        setIsFavorite(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update favorite.');
    }
  }, [id, isFavorite]);

  const handleLogMeal = useCallback(() => {
    // Navigate to tracking with recipe context or show placeholder
    navigation.navigate('TrackingTab');
  }, [navigation]);

  if (loading && !recipe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
        <Text style={styles.loadingText}>Loading recipe…</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <Button title="Back to Recipes" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const steps = recipe.analyzedInstructions?.[0]?.steps || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.mainOrange} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavorite} style={styles.favButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorite ? colors.mainOrange : colors.raven}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="restaurant-outline" size={64} color={colors.raven} />
            </View>
          )}
          <View style={styles.tags}>
            {recipe.vegetarian && <View style={styles.tag}><Text style={styles.tagText}>Vegetarian</Text></View>}
            {recipe.vegan && <View style={[styles.tag, styles.tagVegan]}><Text style={styles.tagText}>Vegan</Text></View>}
            {recipe.glutenFree && <View style={[styles.tag, styles.tagGold]}><Text style={styles.tagText}>Gluten Free</Text></View>}
            {recipe.dairyFree && <View style={[styles.tag, styles.tagCyan]}><Text style={styles.tagText}>Dairy Free</Text></View>}
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.mainOrange} />
              <Text style={styles.metaValue}>{recipe.readyInMinutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={18} color={colors.mainOrange} />
              <Text style={styles.metaValue}>{recipe.servings} servings</Text>
            </View>
            {recipe.healthScore > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="heart-outline" size={18} color={colors.mainOrange} />
                <Text style={styles.metaValue}>Score {recipe.healthScore}</Text>
              </View>
            )}
          </View>
        </View>

        {recipe.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this recipe</Text>
            <Text style={styles.body} selectable>
              {stripLinks(recipe.summary).replace(/<[^>]*>/g, ' ').trim()}
            </Text>
          </View>
        ) : null}

        {recipe.extendedIngredients?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.extendedIngredients.map((ingredient, index) => {
              const checked = checkedIngredients.has(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.ingredientRow, checked && styles.ingredientRowChecked]}
                  onPress={() => toggleIngredient(index)}
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
        ) : null}

        {steps.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {steps.map((step) => {
              const completed = completedSteps.has(step.number);
              return (
                <TouchableOpacity
                  key={step.number}
                  style={[styles.stepCard, completed && styles.stepCardCompleted]}
                  onPress={() => toggleStep(step.number)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepCheckbox, completed && styles.stepCheckboxChecked]}>
                      {completed && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <Text style={styles.stepNumber}>Step {step.number}</Text>
                    {step.length ? (
                      <Text style={styles.stepDuration}>
                        {step.length.number} {step.length.unit}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.stepText}>{step.step}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {nutrition && (nutrition.calories || nutrition.protein || nutrition.netCarbs || nutrition.fat) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition per serving</Text>
            <View style={styles.nutritionGrid}>
              {nutrition.calories && (
                <View style={styles.nutritionItem}>
                  <Ionicons name="flame-outline" size={22} color={colors.mainOrange} />
                  <Text style={styles.nutritionValue}>{nutrition.calories.amount} kcal</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
              )}
              {nutrition.protein && (
                <View style={styles.nutritionItem}>
                  <Ionicons name="nutrition-outline" size={22} color={colors.mainOrange} />
                  <Text style={styles.nutritionValue}>
                    {nutrition.protein.amount}{nutrition.protein.unit}
                  </Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
              )}
              {nutrition.netCarbs && (
                <View style={styles.nutritionItem}>
                  <Ionicons name="leaf-outline" size={22} color={colors.mainOrange} />
                  <Text style={styles.nutritionValue}>
                    {nutrition.netCarbs.amount}{nutrition.netCarbs.unit}
                  </Text>
                  <Text style={styles.nutritionLabel}>Net Carbs</Text>
                </View>
              )}
              {nutrition.fat && (
                <View style={styles.nutritionItem}>
                  <Ionicons name="water-outline" size={22} color={colors.mainOrange} />
                  <Text style={styles.nutritionValue}>
                    {nutrition.fat.amount}{nutrition.fat.unit}
                  </Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {(recipe.diets?.length > 0 || recipe.cuisines?.length > 0) ? (
          <View style={styles.section}>
            {recipe.diets?.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Diets</Text>
                <View style={styles.tagRow}>
                  {recipe.diets.map((d) => (
                    <View key={d} style={styles.tag}>
                      <Text style={styles.tagText}>{d}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            {recipe.cuisines?.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Cuisines</Text>
                <View style={styles.tagRow}>
                  {recipe.cuisines.map((c) => (
                    <View key={c} style={styles.tag}>
                      <Text style={styles.tagText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.logSection}>
          <Button title="Log This Meal" onPress={handleLogMeal} icon="restaurant-outline" />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
  },
  loadingText: {
    ...typography.body,
    color: colors.raven,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.h4,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.mainOrange,
  },
  favButton: {
    padding: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gallery,
  },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gallery,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lima,
  },
  tagVegan: { backgroundColor: '#d9f7be' },
  tagGold: { backgroundColor: '#fffbe6' },
  tagCyan: { backgroundColor: '#e6fffb' },
  tagText: {
    ...typography.caption,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaValue: {
    ...typography.body,
    color: colors.mainOrange,
  },
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
  body: {
    ...typography.body,
    color: colors.raven,
    lineHeight: 22,
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
  stepCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.alabaster,
    borderLeftWidth: 4,
    borderLeftColor: colors.mainOrange,
  },
  stepCardCompleted: {
    opacity: 0.85,
    borderLeftColor: colors.lima,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.mainOrange,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCheckboxChecked: {
    backgroundColor: colors.lima,
    borderColor: colors.lima,
  },
  stepNumber: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  stepDuration: {
    ...typography.caption,
    color: colors.raven,
  },
  stepText: {
    ...typography.body,
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  nutritionValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mainOrange,
  },
  nutritionLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.raven,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  logSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default RecipeDetailsScreen;
