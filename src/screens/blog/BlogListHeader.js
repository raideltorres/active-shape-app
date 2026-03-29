import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const BlogListHeader = ({
  search,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  categories,
  activeCategory,
  onCategoryPress,
  popularTags,
  activeTag,
  onTagPress,
  activeSearch,
  onClearActiveFilter,
}) => {
  const hasActiveFilters = activeSearch || activeTag || activeCategory;

  return (
    <View>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search-outline" size={18} color={colors.raven} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search posts..."
            placeholderTextColor={colors.alto}
            returnKeyType="search"
            onSubmitEditing={onSearchSubmit}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={onClearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.raven} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {categories?.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categories</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.category}
                style={[styles.chip, activeCategory === cat.category && styles.chipActive]}
                onPress={() => onCategoryPress(cat.category)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeCategory === cat.category && styles.chipTextActive]}>
                  {cat.category} ({cat.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {popularTags?.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Popular Tags</Text>
          <View style={styles.chipRow}>
            {popularTags.map((t) => (
              <TouchableOpacity
                key={t.tag}
                style={[styles.chip, activeTag === t.tag && styles.chipActive]}
                onPress={() => onTagPress(t.tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeTag === t.tag && styles.chipTextActive]}>
                  {t.tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {hasActiveFilters && (
        <View style={styles.activeFiltersRow}>
          {activeSearch ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Search: {activeSearch}</Text>
              <TouchableOpacity onPress={() => onClearActiveFilter('search')}>
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : null}
          {activeTag ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Tag: {activeTag}</Text>
              <TouchableOpacity onPress={() => onClearActiveFilter('tag')}>
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : null}
          {activeCategory ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{activeCategory}</Text>
              <TouchableOpacity onPress={() => onClearActiveFilter('category')}>
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity onPress={() => onClearActiveFilter('all')}>
            <Text style={styles.clearAll}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    marginBottom: spacing.md,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.mineShaft,
    height: 44,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.raven,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gallery,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.mainBlue,
    borderColor: colors.mainBlue,
  },
  chipText: {
    ...typography.caption,
    color: colors.raven,
  },
  chipTextActive: {
    color: colors.white,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mainBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeChipText: {
    ...typography.caption,
    color: colors.white,
  },
  clearAll: {
    ...typography.caption,
    color: colors.cinnabar,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default BlogListHeader;
