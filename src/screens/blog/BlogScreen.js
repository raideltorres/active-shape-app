import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useGetPostsQuery, useGetPopularTagsQuery, useGetCategoriesQuery } from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import BlogListHeader from './BlogListHeader';
import BlogListEmpty from './BlogListEmpty';

const POSTS_PER_PAGE = 10;

const BlogScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);

  const queryParams = useMemo(() => ({
    page,
    limit: POSTS_PER_PAGE,
    ...(activeSearch && { search: activeSearch }),
    ...(activeTag && { tag: activeTag }),
    ...(activeCategory && { category: activeCategory }),
  }), [page, activeSearch, activeTag, activeCategory]);

  const { data: postsData, isFetching } = useGetPostsQuery(queryParams);
  const { data: popularTags } = useGetPopularTagsQuery({ limit: 10, recentPostsCount: 20 });
  const { data: categories } = useGetCategoriesQuery();

  useEffect(() => {
    if (!postsData?.data) return;
    if (postsData.currentPage === 1) {
      setAllPosts(postsData.data);
    } else {
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = postsData.data.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newPosts];
      });
    }
  }, [postsData]);

  const resetAndFilter = useCallback((updates) => {
    setPage(1);
    setAllPosts([]);
    if ('tag' in updates) setActiveTag(updates.tag);
    if ('category' in updates) setActiveCategory(updates.category);
    if ('search' in updates) setActiveSearch(updates.search);
  }, []);

  const handleSearch = useCallback(() => {
    resetAndFilter({ search: search.trim(), tag: null, category: null });
  }, [search, resetAndFilter]);

  const handleTagPress = useCallback((tag) => {
    resetAndFilter({
      tag: activeTag === tag ? null : tag,
      category: null,
      search: '',
    });
    setSearch('');
  }, [activeTag, resetAndFilter]);

  const handleCategoryPress = useCallback((category) => {
    resetAndFilter({
      category: activeCategory === category ? null : category,
      tag: null,
      search: '',
    });
    setSearch('');
  }, [activeCategory, resetAndFilter]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && postsData && postsData.currentPage < postsData.totalPages) {
      setPage((p) => p + 1);
    }
  }, [isFetching, postsData]);

  const hasActiveFilters = activeSearch || activeTag || activeCategory;

  const renderPostCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('BlogPost', { slug: item.slug, title: item.title })}
    >
      {item.coverImageUrl && (
        <Image source={{ uri: item.coverImageUrl }} style={styles.postImage} resizeMode="cover" />
      )}
      <View style={styles.postContent}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
        <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        {item.excerpt && <Text style={styles.postExcerpt} numberOfLines={3}>{item.excerpt}</Text>}
        {item.tags?.length > 0 && (
          <View style={styles.postTags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.postFooter}>
          <Text style={styles.readMore}>Read more</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.mainBlue} />
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    resetAndFilter({ search: '', tag: null, category: null });
  }, [resetAndFilter]);

  const handleClearActiveFilter = useCallback((type) => {
    if (type === 'search' || type === 'all') setSearch('');
    resetAndFilter({
      ...(type === 'search' || type === 'all' ? { search: '' } : {}),
      ...(type === 'tag' || type === 'all' ? { tag: null } : {}),
      ...(type === 'category' || type === 'all' ? { category: null } : {}),
    });
  }, [resetAndFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={allPosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPostCard}
        ListHeaderComponent={
          <BlogListHeader
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearch}
            onClearSearch={handleClearSearch}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryPress}
            popularTags={popularTags}
            activeTag={activeTag}
            onTagPress={handleTagPress}
            activeSearch={activeSearch}
            onClearActiveFilter={handleClearActiveFilter}
          />
        }
        ListEmptyComponent={
          <BlogListEmpty isFetching={isFetching} hasActiveFilters={hasActiveFilters} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetching ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.mainBlue} />
            </View>
          ) : null
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  placeholder: { width: 40 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gallery,
  },
  postContent: {
    padding: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.mainBlue}14`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.mainBlue,
    fontWeight: '600',
  },
  postTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },
  postExcerpt: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  tagPill: {
    backgroundColor: colors.alabaster,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagPillText: {
    ...typography.caption,
    color: colors.raven,
    fontSize: 11,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    ...typography.bodySmall,
    color: colors.mainBlue,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});

export default BlogScreen;
