import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { WorkoutTypeIcon } from "../../components/molecules";
import { colors, spacing, typography, borderRadius } from "../../theme";

const ALL_TYPE_ITEM = {
  value: null,
  icon: "apps-outline",
  label: "All",
  description: "No filter",
  color: colors.mainOrange,
};

const WorkoutListHeader = ({
  typeItems,
  type,
  onTypeChange,
  criteria,
  onCriteriaChange,
  activeFilterChips,
  favoritesOnly,
  onFavoritesToggle,
  onOpenFilterModal,
  isFetching,
  resultCount,
}) => (
  <>
    {typeItems.length > 0 && (
      <View style={styles.typeCardsRow}>
        {[ALL_TYPE_ITEM, ...typeItems].map((item) => {
          const active = type === item.value;
          return (
            <TouchableOpacity
              key={item.value ?? "all"}
              style={[
                styles.typeCard,
                active && { borderColor: item.color },
              ]}
              onPress={() => onTypeChange(item.value)}
              activeOpacity={0.7}
            >
              {active && (
                <View
                  style={[
                    styles.typeCheckmark,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={colors.white}
                  />
                </View>
              )}
              <View
                style={[
                  styles.typeIconWrap,
                  { backgroundColor: `${item.color}12` },
                ]}
              >
                <WorkoutTypeIcon meta={item} size={22} color={item.color} />
              </View>
              <Text
                style={[styles.typeLabel, active && { color: item.color }]}
              >
                {item.label}
              </Text>
              <Text style={styles.typeDesc}>{item.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    )}

    <View style={styles.searchRow}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color={colors.raven} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          placeholderTextColor={colors.alto}
          value={criteria}
          onChangeText={onCriteriaChange}
          returnKeyType="search"
        />
        {criteria.length > 0 && (
          <TouchableOpacity onPress={() => onCriteriaChange("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.raven} />
          </TouchableOpacity>
        )}
      </View>
    </View>

    <View style={styles.filtersBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activeFiltersScroll}
        style={styles.activeFiltersScrollView}
      >
        {activeFilterChips.map((chip) => (
          <View key={chip.id} style={styles.filterChip}>
            <Text style={styles.filterChipText} numberOfLines={1}>
              {chip.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.favToggle, favoritesOnly && styles.favToggleActive]}
        onPress={onFavoritesToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={favoritesOnly ? "heart" : "heart-outline"}
          size={16}
          color={favoritesOnly ? colors.mainOrange : colors.raven}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={onOpenFilterModal}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={colors.mainOrange}
        />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
    </View>

    {!isFetching && (
      <Text style={styles.resultCount}>
        {resultCount} workout{resultCount !== 1 ? "s" : ""} found
      </Text>
    )}
  </>
);

const styles = StyleSheet.create({
  typeCardsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gallery,
    position: "relative",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  typeCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  typeLabel: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: colors.mineShaft,
    marginBottom: 2,
  },
  typeDesc: {
    ...typography.caption,
    color: colors.raven,
    textAlign: "center",
    fontSize: 10,
  },
  searchRow: {
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.mineShaft,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  filtersBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
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
  },
  filterChip: {
    backgroundColor: colors.gallery,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    maxWidth: 140,
  },
  filterChipText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.mineShaft,
    fontWeight: "500",
  },
  favToggle: {
    padding: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  favToggleActive: {
    backgroundColor: `${colors.mainOrange}08`,
  },
  filterButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.mainOrange,
    fontWeight: "600",
  },
  resultCount: {
    ...typography.bodySmall,
    color: colors.raven,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
});

export default React.memo(WorkoutListHeader);
