import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useGetProfileQuery, useUpsertUserMutation, useGetAllConstantsQuery, useAutocompleteIngredientsMutation } from '../../../store/api';
import { OptionPicker } from '../../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { shadows } from '../../../theme/shadows';
import { DIET_OPTIONS } from '../../../utils/measure';

const INGREDIENTS_IMG_BASE_URL = 'https://img.spoonacular.com/ingredients_250x250/';

const DietCard = ({ option, selected, onPress, saving }) => (
  <TouchableOpacity
    style={[styles.dietCard, selected && styles.dietCardSelected]}
    onPress={() => onPress(option.value)}
    activeOpacity={0.7}
    disabled={saving}
  >
    {selected && (
      <View style={styles.dietCheckmark}>
        <Ionicons name="checkmark-circle" size={22} color={colors.mainOrange} />
      </View>
    )}
    <View style={styles.dietCardHeader}>
      <View style={[styles.dietIconWrap, selected && styles.dietIconWrapSelected]}>
        <Ionicons name={option.icon} size={20} color={selected ? colors.mainOrange : colors.raven} />
      </View>
      <Text style={[styles.dietCardTitle, selected && styles.dietCardTitleSelected]}>{option.label}</Text>
    </View>
    <Text style={styles.dietCardDesc}>{option.description}</Text>
    {(option.allowed || option.excluded) && (
      <View style={styles.dietFoods}>
        {option.allowed && (
          <Text style={styles.dietFoodLine}>
            <Text style={styles.dietFoodYes}>Yes: </Text>{option.allowed}
          </Text>
        )}
        {option.excluded && (
          <Text style={styles.dietFoodLine}>
            <Text style={styles.dietFoodNo}>No: </Text>{option.excluded}
          </Text>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const RecipesTab = () => {
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: profile } = useGetProfileQuery();
  const { data: constantsData } = useGetAllConstantsQuery();
  const [upsertUser] = useUpsertUserMutation();
  const [autocompleteIngredients, { data: autocompleteResults }] = useAutocompleteIngredientsMutation();

  const serverDiet = profile?.onboarding?.healthAndFitnessGoals?.dietaryPreference || 'none';
  const serverAllergies = useMemo(() => profile?.onboarding?.healthInformation?.allergies || [], [profile]);
  const blacklist = useMemo(() => profile?.recipes?.ingredientsBlackList || [], [profile]);

  const [draftDiet, setDraftDiet] = useState(serverDiet);
  const [draftAllergies, setDraftAllergies] = useState(serverAllergies);

  useEffect(() => { setDraftDiet(serverDiet); }, [serverDiet]);
  useEffect(() => { setDraftAllergies(serverAllergies); }, [serverAllergies]);

  const isDirty = useMemo(() => {
    if (draftDiet !== serverDiet) return true;
    if (draftAllergies.length !== serverAllergies.length) return true;
    const sorted = [...draftAllergies].sort();
    const serverSorted = [...serverAllergies].sort();
    return sorted.some((v, i) => v !== serverSorted[i]);
  }, [draftDiet, serverDiet, draftAllergies, serverAllergies]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await upsertUser({
        id: profile?._id,
        onboarding: {
          ...profile?.onboarding,
          healthAndFitnessGoals: {
            ...profile?.onboarding?.healthAndFitnessGoals,
            dietaryPreference: draftDiet,
          },
          healthInformation: {
            ...profile?.onboarding?.healthInformation,
            allergies: draftAllergies,
          },
        },
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Saved', text2: 'Recipe preferences updated.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  }, [profile, upsertUser, draftDiet, draftAllergies]);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
    if (text.length >= 2) {
      autocompleteIngredients(text);
    }
  }, [autocompleteIngredients]);

  const handleAddToBlacklist = useCallback(async (ingredient) => {
    const currentList = profile?.recipes?.ingredientsBlackList || [];
    if (currentList.some((item) => item.name === ingredient.name)) return;

    try {
      await upsertUser({
        id: profile?._id,
        recipes: { ...profile?.recipes, ingredientsBlackList: [...currentList, { name: ingredient.name, image: ingredient.image }] },
      }).unwrap();
      setSearchText('');
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add ingredient to blacklist.' });
    }
  }, [profile, upsertUser]);

  const handleRemoveFromBlacklist = useCallback(async (ingredientName) => {
    const newList = blacklist.filter((item) => item.name !== ingredientName);
    try {
      await upsertUser({
        id: profile?._id,
        recipes: { ...profile?.recipes, ingredientsBlackList: newList },
      }).unwrap();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to remove ingredient.' });
    }
  }, [profile, upsertUser, blacklist]);

  const suggestions = useMemo(() => {
    if (!autocompleteResults || searchText.length < 2) return [];
    return autocompleteResults.slice(0, 8);
  }, [autocompleteResults, searchText]);

  return (
    <>
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={20} color={colors.mainBlue} />
        <Text style={styles.bannerText}>
          These settings affect recipe searches, meal plans, and suggestions.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.mainBlue}15` }]}>
            <Ionicons name="heart-outline" size={20} color={colors.mainBlue} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Dietary Preferences</Text>
            <Text style={styles.cardSubtitle}>Select the diet that matches your lifestyle</Text>
          </View>
        </View>
        <View style={styles.dietGrid}>
          {DIET_OPTIONS.map((option) => (
            <DietCard key={option.value} option={option} selected={draftDiet === option.value} onPress={setDraftDiet} saving={saving} />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.error}15` }]}>
            <Ionicons name="shield-outline" size={20} color={colors.error} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Allergies & Intolerances</Text>
            <Text style={styles.cardSubtitle}>Recipes with these will be excluded</Text>
          </View>
        </View>
        <OptionPicker
          options={(constantsData?.allergies || []).filter((o) => !/^other$/i.test(o.text))}
          value={draftAllergies}
          onChange={setDraftAllergies}
          multiple
          showNone
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isDirty || saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.mainOrange}15` }]}>
            <Ionicons name="close-circle-outline" size={20} color={colors.mainOrange} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Ingredient Blacklist</Text>
            <Text style={styles.cardSubtitle}>Block specific ingredients from all recipes</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.raven} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an ingredient..."
            placeholderTextColor={colors.raven}
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item) => (
              <TouchableOpacity key={item.name} style={styles.suggestionItem} onPress={() => handleAddToBlacklist(item)}>
                {item.image && <Image source={{ uri: `${INGREDIENTS_IMG_BASE_URL}${item.image}` }} style={styles.suggestionImage} />}
                <Text style={styles.suggestionText}>{item.name}</Text>
                <Ionicons name="add-circle-outline" size={20} color={colors.mainOrange} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {blacklist.length > 0 ? (
          <View style={styles.chipGrid}>
            {blacklist.map((item) => (
              <View key={item.name} style={styles.blacklistChip}>
                {item.image && <Image source={{ uri: `${INGREDIENTS_IMG_BASE_URL}${item.image}` }} style={styles.blacklistImage} />}
                <Text style={styles.blacklistName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveFromBlacklist(item.name)}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBlock}>
            <Ionicons name="restaurant-outline" size={28} color={colors.raven} />
            <Text style={styles.emptyText}>No blacklisted ingredients yet</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: `${colors.mainBlue}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  bannerText: { ...typography.bodySmall, color: colors.raven, flex: 1, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardHeaderText: { flex: 1 },
  cardTitle: { ...typography.h4, color: colors.mineShaft },
  cardSubtitle: { ...typography.caption, color: colors.raven, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dietGrid: { gap: spacing.md },
  dietCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.gallery,
    backgroundColor: colors.alabaster,
    position: 'relative',
  },
  dietCardSelected: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}06`,
  },
  dietCheckmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  dietCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dietIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.raven}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietIconWrapSelected: {
    backgroundColor: `${colors.mainOrange}15`,
  },
  dietCardTitle: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  dietCardTitleSelected: {
    color: colors.mainOrange,
  },
  dietCardDesc: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  dietFoods: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    gap: 4,
  },
  dietFoodLine: {
    ...typography.caption,
    color: colors.raven,
    lineHeight: 18,
  },
  dietFoodYes: {
    fontWeight: '700',
    color: colors.lima,
  },
  dietFoodNo: {
    fontWeight: '700',
    color: colors.error,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.mineShaft, paddingVertical: spacing.md },
  suggestionsContainer: { backgroundColor: colors.alabaster, borderRadius: borderRadius.lg, marginBottom: spacing.md, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gallery },
  suggestionImage: { width: 32, height: 32, borderRadius: 8 },
  suggestionText: { ...typography.body, color: colors.mineShaft, flex: 1, textTransform: 'capitalize' },
  blacklistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  blacklistImage: { width: 24, height: 24, borderRadius: 6 },
  blacklistName: { ...typography.bodySmall, color: colors.mineShaft, fontWeight: '500', textTransform: 'capitalize', maxWidth: 120 },
  emptyBlock: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.raven },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 2,
    marginBottom: spacing.lg,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: colors.alto,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});

export default RecipesTab;
