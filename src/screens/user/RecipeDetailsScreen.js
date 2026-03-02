import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  useGetRecipeDetailsQuery,
  useAddRecipeFavoriteMutation,
  useRemoveRecipeFavoriteMutation,
} from '../../store/api';
import Button from '../../components/atoms/Button';
import LogMealModal from '../../components/organisms/LogMealModal';
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

const NutritionRow = ({ icon, value, label }) => (
  <View style={styles.nutritionRow}>
    <View style={styles.nutritionIcon}>
      <Ionicons name={icon} size={20} color={colors.mainOrange} />
    </View>
    <Text style={styles.nutritionValue}>{value}</Text>
    <Text style={styles.nutritionLabel}>{label}</Text>
  </View>
);

const RecipeDetailsScreen = ({ navigation, route }) => {
  const { id, isFavorite: initialFavorite } = route.params || {};
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));
  const [logModalVisible, setLogModalVisible] = useState(false);

  const { data: recipe, isLoading: loading, error: queryError } = useGetRecipeDetailsQuery(id, { skip: !id });
  const error = queryError ? (queryError.data?.message || 'Failed to load recipe') : (!id ? 'No recipe ID' : null);

  const [addFavoriteMutation] = useAddRecipeFavoriteMutation();
  const [removeFavoriteMutation] = useRemoveRecipeFavoriteMutation();

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
        await removeFavoriteMutation(String(id)).unwrap();
        setIsFavorite(false);
      } else {
        await addFavoriteMutation(String(id)).unwrap();
        setIsFavorite(true);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update favorite.' });
    }
  }, [id, isFavorite, addFavoriteMutation, removeFavoriteMutation]);

  const handleLogMeal = useCallback(() => setLogModalVisible(true), []);

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
            <View style={styles.nutritionHeader}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <Text style={styles.nutritionPerServing}>Per serving</Text>
            </View>
            <View style={styles.nutritionList}>
              {nutrition.calories && (
                <NutritionRow icon="flame-outline" value={`${nutrition.calories.amount} kcal`} label="Calories" />
              )}
              {nutrition.protein && (
                <NutritionRow icon="nutrition-outline" value={`${nutrition.protein.amount}${nutrition.protein.unit}`} label="Protein" />
              )}
              {nutrition.netCarbs && (
                <NutritionRow icon="leaf-outline" value={`${nutrition.netCarbs.amount}${nutrition.netCarbs.unit}`} label="Net Carbs" />
              )}
              {nutrition.fat && (
                <NutritionRow icon="water-outline" value={`${nutrition.fat.amount}${nutrition.fat.unit}`} label="Fat" />
              )}
              {nutrition.fiber && (
                <NutritionRow icon="git-branch-outline" value={`${nutrition.fiber.amount}${nutrition.fiber.unit}`} label="Fiber" />
              )}
              {nutrition.sugar && (
                <NutritionRow icon="flame-outline" value={`${nutrition.sugar.amount}${nutrition.sugar.unit}`} label="Sugar" />
              )}
            </View>
          </View>
        ) : null}

        {recipe.diets?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diets</Text>
            <View style={styles.tagRow}>
              {recipe.diets.map((d) => (
                <View key={d} style={styles.dietTag}>
                  <Text style={styles.dietTagText}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {recipe.cuisines?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuisines</Text>
            <View style={styles.tagRow}>
              {recipe.cuisines.map((c) => (
                <View key={c} style={styles.cuisineTag}>
                  <Text style={styles.cuisineTagText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.logSection}>
          <Button title="Log This Meal" onPress={handleLogMeal} icon="restaurant-outline" />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LogMealModal
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        recipe={recipe}
        nutrition={nutrition}
      />
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
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nutritionPerServing: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  nutritionList: {
    gap: spacing.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  nutritionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nutritionValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.mineShaft,
    flex: 1,
  },
  nutritionLabel: {
    ...typography.body,
    color: colors.raven,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dietTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.mainOrange}15`,
    borderWidth: 1,
    borderColor: colors.mainOrange,
  },
  dietTagText: {
    ...typography.bodySmall,
    color: colors.mainOrange,
    fontWeight: '600',
  },
  cuisineTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.alto,
  },
  cuisineTagText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '500',
  },
  logSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.tabBarPadding,
  },
});

export default RecipeDetailsScreen;
