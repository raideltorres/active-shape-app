import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";

import { TabScreenLayout } from "../../components/templates";
import { RecipeCard } from "../../components/molecules";
import {
  useLazySearchRecipesQuery,
  useLazyGetUserRecipeFiltersQuery,
  useSaveUserRecipeFiltersMutation,
  useAddRecipeFavoriteMutation,
  useRemoveRecipeFavoriteMutation,
} from "../../store/api";
import { colors, spacing, typography, borderRadius } from "../../theme";
import RecipeFilterModal, {
  DIET_OPTIONS,
  DISH_TYPE_OPTIONS,
  CALORIES_MAX,
  CARBS_MAX,
  PROTEIN_MAX,
  FAT_MAX,
  FIBER_MAX,
} from "./RecipeFilterModal";

const PAGE_SIZE = 20;

// Web API filter keys
const defaultFilters = {
  diet: "",
  type: "",
  minCalories: "",
  maxCalories: "",
  minCarbs: "",
  maxCarbs: "",
  minProtein: "",
  maxProtein: "",
  minFat: "",
  maxFat: "",
  minSaturatedFat: "",
  maxSaturatedFat: "",
  minFiber: "",
  maxFiber: "",
};

const RecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterForm, setFilterForm] = useState({
    diet: "",
    type: "",
    minCalories: 0,
    maxCalories: CALORIES_MAX,
    minCarbs: 0,
    maxCarbs: CARBS_MAX,
    minProtein: 0,
    maxProtein: PROTEIN_MAX,
    minFat: 0,
    maxFat: FAT_MAX,
    minSaturatedFat: 0,
    maxSaturatedFat: FAT_MAX,
    minFiber: 0,
    maxFiber: FIBER_MAX,
  });
  const [error, setError] = useState(null);

  const [triggerSearch] = useLazySearchRecipesQuery();
  const [triggerGetFilters] = useLazyGetUserRecipeFiltersQuery();
  const [saveFilters] = useSaveUserRecipeFiltersMutation();
  const [addFavorite] = useAddRecipeFavoriteMutation();
  const [removeFavorite] = useRemoveRecipeFavoriteMutation();

  const hasMore = recipes.length < totalResults;

  const { primaryFilterChips, otherFiltersCount } = useMemo(() => {
    const primary = [];
    if (filters.diet) {
      const label = DIET_OPTIONS.find((o) => o.value === filters.diet)?.label;
      if (label) primary.push({ id: "diet", label });
    }
    if (filters.type) {
      const label = DISH_TYPE_OPTIONS.find(
        (o) => o.value === filters.type,
      )?.label;
      if (label) primary.push({ id: "type", label });
    }
    let other = 0;
    const minCal = Number(filters.minCalories) || 0;
    const maxCal = Number(filters.maxCalories) || CALORIES_MAX;
    if (minCal > 0 || maxCal < CALORIES_MAX) other += 1;
    const minC = Number(filters.minCarbs) || 0;
    const maxC = Number(filters.maxCarbs) || CARBS_MAX;
    if (minC > 0 || maxC < CARBS_MAX) other += 1;
    const minP = Number(filters.minProtein) || 0;
    const maxP = Number(filters.maxProtein) || PROTEIN_MAX;
    if (minP > 0 || maxP < PROTEIN_MAX) other += 1;
    const minF = Number(filters.minFat) || 0;
    const maxF = Number(filters.maxFat) || FAT_MAX;
    if (minF > 0 || maxF < FAT_MAX) other += 1;
    const minSat = Number(filters.minSaturatedFat) || 0;
    const maxSat = Number(filters.maxSaturatedFat) || FAT_MAX;
    if (minSat > 0 || maxSat < FAT_MAX) other += 1;
    const minFib = Number(filters.minFiber) || 0;
    const maxFib = Number(filters.maxFiber) || FIBER_MAX;
    if (minFib > 0 || maxFib < FIBER_MAX) other += 1;
    return { primaryFilterChips: primary, otherFiltersCount: other };
  }, [filters]);

  const searchRecipes = useCallback(
    async (opts = {}) => {
      const { page: pageNum = 1, append = false, searchFilters } = opts;
      const activeFilters = searchFilters || filters;
      const pagination = { pageSize: PAGE_SIZE, page: pageNum };
      try {
        if (append) setLoadingMore(true);
        else if (pageNum === 1) setLoading(true);
        setError(null);
        const { data } = await triggerSearch({ filters: activeFilters, pagination });
        const list = data?.results || [];
        setTotalResults(data?.totalResults ?? 0);
        if (append) {
          setRecipes((prev) => {
            const byId = new Map(prev.map((r) => [r.id, r]));
            list.forEach((r) => byId.set(r.id, r));
            return Array.from(byId.values());
          });
        } else {
          setRecipes(list);
        }
        setPage(pageNum);
      } catch (err) {
        setError(err.message || "Failed to load recipes");
        if (!append) setRecipes([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, triggerSearch],
  );

  const loadInitialFiltersAndSearch = useCallback(async () => {
    try {
      setLoading(true);
      const { data: filtersData } = await triggerGetFilters();
      const saved = filtersData?.filters || {};
      const next = { ...defaultFilters, ...saved };
      setFilters(next);
      setFilterForm({
        diet: next.diet || "",
        type: next.type || "",
        minCalories: Number(next.minCalories) || 0,
        maxCalories: Number(next.maxCalories) || CALORIES_MAX,
        minCarbs: Number(next.minCarbs) || 0,
        maxCarbs: Number(next.maxCarbs) || CARBS_MAX,
        minProtein: Number(next.minProtein) || 0,
        maxProtein: Number(next.maxProtein) || PROTEIN_MAX,
        minFat: Number(next.minFat) || 0,
        maxFat: Number(next.maxFat) || FAT_MAX,
        minSaturatedFat: Number(next.minSaturatedFat) || 0,
        maxSaturatedFat: Number(next.maxSaturatedFat) || FAT_MAX,
        minFiber: Number(next.minFiber) || 0,
        maxFiber: Number(next.maxFiber) || FIBER_MAX,
      });
      setPage(1);
      await searchRecipes({ page: 1, searchFilters: next });
    } catch (err) {
      setError(err.message || "Failed to load recipes");
      setRecipes([]);
      setLoading(false);
    }
  }, [triggerGetFilters, searchRecipes]);

  useEffect(() => {
    loadInitialFiltersAndSearch();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    searchRecipes({ page: 1 }).finally(() => setRefreshing(false));
  }, [searchRecipes]);

  const onLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    searchRecipes({ page: page + 1, append: true });
  }, [loadingMore, hasMore, page, searchRecipes]);

  const handleFavorite = useCallback(async (id, isFavorite) => {
    try {
      if (isFavorite) {
        await removeFavorite(id).unwrap();
      } else {
        await addFavorite(id).unwrap();
      }
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorite: !isFavorite } : r)),
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update favorite.' });
    }
  }, [addFavorite, removeFavorite]);

  const handleApplyFilters = useCallback(async () => {
    const next = {
      ...defaultFilters,
      diet: filterForm.diet || "",
      type: filterForm.type || "",
      minCalories: filterForm.minCalories,
      maxCalories: filterForm.maxCalories,
      minCarbs: filterForm.minCarbs,
      maxCarbs: filterForm.maxCarbs,
      minProtein: filterForm.minProtein,
      maxProtein: filterForm.maxProtein,
      minFat: filterForm.minFat,
      maxFat: filterForm.maxFat,
      minSaturatedFat: filterForm.minSaturatedFat,
      maxSaturatedFat: filterForm.maxSaturatedFat,
      minFiber: filterForm.minFiber,
      maxFiber: filterForm.maxFiber,
    };
    setFilters(next);
    setFilterModalVisible(false);
    try {
      await saveFilters(next).unwrap();
    } catch (err) {
      // Still apply locally
    }
    setPage(1);
    await searchRecipes({ page: 1, searchFilters: next });
  }, [filterForm, saveFilters, searchRecipes]);

  const renderRecipe = useCallback(
    ({ item }) => (
      <RecipeCard
        {...item}
        onFavorite={handleFavorite}
        onPress={(id) =>
          navigation.navigate("RecipeDetails", {
            id: String(id),
            isFavorite: item.isFavorite,
          })
        }
      />
    ),
    [handleFavorite, navigation],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.mainOrange} />
      </View>
    );
  }, [loadingMore]);

  return (
    <TabScreenLayout
      title="Recipes"
      showHeader={true}
      scrollable={false}
      contentContainerStyle={styles.layoutContent}
    >
      <View style={styles.headerActions}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersScroll}
          style={styles.activeFiltersScrollView}
        >
          {primaryFilterChips.map((chip) => (
            <View key={chip.id} style={styles.filterChip}>
              <Text style={styles.filterChipText} numberOfLines={1}>
                {chip.label}
              </Text>
            </View>
          ))}
          {otherFiltersCount > 0 && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>+{otherFiltersCount}</Text>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={colors.mainOrange}
          />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {loading && recipes.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
          <Text style={styles.loadingText}>Loading recipes…</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="restaurant-outline" size={64} color={colors.raven} />
          <Text style={styles.emptyText}>
            {error
              ? "Could not load recipes. Pull to try again."
              : "No recipes found. Try adjusting filters."}
          </Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={renderFooter}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.mainOrange]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <RecipeFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filterForm={filterForm}
        onFilterFormChange={(updates) =>
          setFilterForm((f) => ({ ...f, ...updates }))
        }
        onApply={handleApplyFilters}
      />
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  layoutContent: {
    flex: 1,
    paddingBottom: 0,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  activeFiltersScrollView: {
    flex: 1,
    minWidth: 0,
  },
  activeFiltersScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.gallery,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    maxWidth: 140,
  },
  filterChipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.mineShaft,
  },
  filterButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.mainOrange,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarPadding || 24,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.raven,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.raven,
    marginTop: spacing.md,
  },
});

export default RecipesScreen;
