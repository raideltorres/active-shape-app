import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { TabScreenLayout } from "../../components/templates";
import { FilterCardSelect, Button } from "../../components/atoms";
import { WorkoutCard, WORKOUT_TYPE_META } from "../../components/molecules";
import {
  useGetWorkoutConfigurationsQuery,
  useGetWorkoutsQuery,
  useGetUserFavoriteWorkoutsQuery,
  useAddUserFavoriteWorkoutMutation,
  useDeleteUserFavoriteWorkoutMutation,
} from "../../store/api";
import { colors, spacing, typography, borderRadius } from "../../theme";
import { capitalize } from "../../utils/string";
import WorkoutListHeader from "./WorkoutListHeader";
import WorkoutListEmpty from "./WorkoutListEmpty";

const ROWS_PER_PAGE = 25;

const buildFilters = ({ criteria, type, level, objective, muscleGroup }) => {
  const filters = {};
  if (criteria) filters.criteria = criteria;
  if (type) filters.type = type;
  if (level) filters.level = level;
  if (objective) filters.objective = objective;
  if (muscleGroup) filters.muscleGroup = muscleGroup;
  return filters;
};

const mapToSelectOptions = (items = []) => [
  { value: null, label: "All" },
  ...items.map((item) => ({
    value: item,
    label: capitalize(item).replace("_", " "),
  })),
];

const MIN_CARD_WIDTH = 200;

const WorkoutScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const numColumns =
    width >= MIN_CARD_WIDTH * 2 + spacing.md + spacing.lg * 2 ? 2 : 1;

  const [criteria, setCriteria] = useState("");
  const [type, setType] = useState(null);
  const [level, setLevel] = useState(null);
  const [objective, setObjective] = useState(null);
  const [muscleGroup, setMuscleGroup] = useState(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterForm, setFilterForm] = useState({
    level: null,
    objective: null,
    muscleGroup: null,
  });

  const { data: configData } = useGetWorkoutConfigurationsQuery();
  const enumerators = configData?.enumerators;

  const queryParams = useMemo(
    () => ({
      page,
      limit: ROWS_PER_PAGE,
      filters: buildFilters({ criteria, type, level, objective, muscleGroup }),
    }),
    [page, criteria, type, level, objective, muscleGroup],
  );

  const { data: workoutsData, isFetching } = useGetWorkoutsQuery(queryParams);
  const { data: favorites } = useGetUserFavoriteWorkoutsQuery();
  const [addFavorite] = useAddUserFavoriteWorkoutMutation();
  const [deleteFavorite] = useDeleteUserFavoriteWorkoutMutation();

  const favoriteWorkoutIds = useMemo(
    () => favorites?.map((f) => f.workoutId) ?? [],
    [favorites],
  );

  const displayedWorkouts = useMemo(() => {
    if (!workoutsData?.data) return [];
    if (!favoritesOnly) return workoutsData.data;
    return workoutsData.data.filter((w) => favoriteWorkoutIds.includes(w._id));
  }, [workoutsData?.data, favoritesOnly, favoriteWorkoutIds]);

  useEffect(() => {
    setPage(1);
  }, [criteria, type, level, objective, muscleGroup]);

  const handleFavorite = useCallback(
    async (id) => {
      const isFav = favoriteWorkoutIds.includes(id);
      if (isFav) {
        const fav = favorites?.find((f) => f.workoutId === id);
        if (fav) await deleteFavorite(fav._id).unwrap();
      } else {
        await addFavorite(id).unwrap();
      }
    },
    [favoriteWorkoutIds, favorites, addFavorite, deleteFavorite],
  );

  const typeItems = useMemo(() => {
    if (!enumerators?.workoutTypes) return [];
    return enumerators.workoutTypes
      .filter((t) => t !== "all")
      .map((t) => ({
        value: t,
        ...(WORKOUT_TYPE_META[t] || {
          icon: "barbell-outline",
          label: capitalize(t),
          description: "",
          color: colors.mainOrange,
        }),
      }));
  }, [enumerators]);

  const levelOptions = useMemo(
    () => mapToSelectOptions(enumerators?.workoutLevels),
    [enumerators],
  );
  const objectiveOptions = useMemo(
    () => mapToSelectOptions(enumerators?.workoutObjectives),
    [enumerators],
  );
  const muscleGroupOptions = useMemo(
    () => mapToSelectOptions(enumerators?.muscleGroups),
    [enumerators],
  );

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (level) chips.push({ id: "level", label: capitalize(level) });
    if (objective)
      chips.push({ id: "objective", label: capitalize(objective) });
    if (muscleGroup)
      chips.push({
        id: "muscleGroup",
        label: capitalize(muscleGroup).replace("_", " "),
      });
    return chips;
  }, [level, objective, muscleGroup]);

  const openFilterModal = useCallback(() => {
    setFilterForm({ level, objective, muscleGroup });
    setFilterModalVisible(true);
  }, [level, objective, muscleGroup]);

  const handleApplyFilters = useCallback(() => {
    setLevel(filterForm.level);
    setObjective(filterForm.objective);
    setMuscleGroup(filterForm.muscleGroup);
    setFilterModalVisible(false);
  }, [filterForm]);

  const handleClearFilters = useCallback(() => {
    setFilterForm({ level: null, objective: null, muscleGroup: null });
  }, []);

  const renderWorkoutCard = useCallback(
    ({ item }) => (
      <WorkoutCard
        workout={item}
        isFavorite={favoriteWorkoutIds.includes(item._id)}
        onSelect={() =>
          navigation.navigate("WorkoutDetail", { workoutId: item._id })
        }
        onFavorite={() => handleFavorite(item._id)}
      />
    ),
    [favoriteWorkoutIds, navigation, handleFavorite],
  );

  const keyExtractor = useCallback((item) => item._id, []);

  const handleToggleFavorites = useCallback(
    () => setFavoritesOnly((prev) => !prev),
    [],
  );

  return (
    <TabScreenLayout
      title="Workouts"
      subtitle="Browse our workout library and find the perfect routine for your goals"
      scrollable={false}
    >
      <FlatList
        data={displayedWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={keyExtractor}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <WorkoutListHeader
            typeItems={typeItems}
            type={type}
            onTypeChange={setType}
            criteria={criteria}
            onCriteriaChange={setCriteria}
            activeFilterChips={activeFilterChips}
            favoritesOnly={favoritesOnly}
            onFavoritesToggle={handleToggleFavorites}
            onOpenFilterModal={openFilterModal}
            isFetching={isFetching}
            resultCount={displayedWorkouts.length}
          />
        }
        ListEmptyComponent={
          <WorkoutListEmpty
            isFetching={isFetching}
            favoritesOnly={favoritesOnly}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.raven} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator>
              {enumerators?.workoutLevels && (
                <View style={styles.filterBlock}>
                  <FilterCardSelect
                    label="Level"
                    title="Difficulty"
                    value={filterForm.level}
                    options={levelOptions}
                    placeholder="All levels"
                    onSelect={(v) => setFilterForm((f) => ({ ...f, level: v }))}
                  />
                </View>
              )}

              {enumerators?.workoutObjectives && (
                <View style={styles.filterBlock}>
                  <FilterCardSelect
                    label="Objective"
                    title="Training goal"
                    value={filterForm.objective}
                    options={objectiveOptions}
                    placeholder="All objectives"
                    onSelect={(v) =>
                      setFilterForm((f) => ({ ...f, objective: v }))
                    }
                  />
                </View>
              )}

              {enumerators?.muscleGroups && (
                <View style={styles.filterBlock}>
                  <FilterCardSelect
                    label="Muscle"
                    title="Target muscle group"
                    value={filterForm.muscleGroup}
                    options={muscleGroupOptions}
                    placeholder="All groups"
                    onSelect={(v) =>
                      setFilterForm((f) => ({ ...f, muscleGroup: v }))
                    }
                  />
                </View>
              )}

              {(filterForm.level ||
                filterForm.objective ||
                filterForm.muscleGroup) && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearFilters}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color={colors.mainOrange}
                  />
                  <Text style={styles.clearBtnText}>Clear all filters</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Apply"
                onPress={handleApplyFilters}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  /* Grid */
  listContent: { paddingBottom: spacing.tabBarPadding },
  gridRow: { gap: spacing.md },

  /* Filter Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  modalTitle: { ...typography.h3, color: colors.mineShaft },
  modalBody: {
    padding: spacing.lg,
    flex: 1,
  },
  filterBlock: {
    marginBottom: spacing.lg,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  clearBtnText: {
    ...typography.bodySmall,
    color: colors.mainOrange,
    fontWeight: "600",
  },
  modalFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 16,
  },
});

export default WorkoutScreen;
