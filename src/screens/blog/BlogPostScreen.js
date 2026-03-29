import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';

import { useGetPostBySlugQuery } from '../../store/api';
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';

const BlogPostScreen = ({ route }) => {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const contentWidth = width - spacing.lg * 2;
  const { data: post, isLoading, error } = useGetPostBySlugQuery(slug, { skip: !slug });

  const tagsMap = {
    body: { color: colors.mineShaft, fontSize: 15, lineHeight: 24 },
    p: { marginBottom: 12, lineHeight: 24 },
    h1: { fontSize: 24, fontWeight: '700', color: colors.mineShaft, marginBottom: 12, marginTop: 20 },
    h2: { fontSize: 20, fontWeight: '700', color: colors.mineShaft, marginBottom: 10, marginTop: 18 },
    h3: { fontSize: 18, fontWeight: '600', color: colors.mineShaft, marginBottom: 8, marginTop: 16 },
    h4: { fontSize: 16, fontWeight: '600', color: colors.mineShaft, marginBottom: 8, marginTop: 14 },
    a: { color: colors.mainBlue, textDecorationLine: 'underline' },
    ul: { marginBottom: 12, paddingLeft: 8 },
    ol: { marginBottom: 12, paddingLeft: 8 },
    li: { marginBottom: 4, lineHeight: 22 },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.mainBlue,
      paddingLeft: 12,
      marginVertical: 12,
      backgroundColor: `${colors.mainBlue}08`,
      paddingVertical: 8,
      borderRadius: 4,
    },
    img: { borderRadius: 8 },
    strong: { fontWeight: '700' },
    em: { fontStyle: 'italic' },
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Blog" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Blog" />
        <View style={styles.errorWrap}>
          <Ionicons name="document-text-outline" size={48} color={colors.mercury} />
          <Text style={styles.errorTitle}>Post not found</Text>
          <Text style={styles.errorDescription}>This post may have been removed or the link is incorrect.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Blog" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {post.coverImageUrl && (
          <Image source={{ uri: post.coverImageUrl }} style={styles.coverImage} resizeMode="cover" />
        )}

        <View style={styles.metaRow}>
          {post.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{post.category}</Text>
            </View>
          )}
          {post.createdAt && (
            <Text style={styles.dateText}>
              {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          )}
        </View>

        <Text style={styles.title}>{post.title}</Text>

        {post.excerpt && <Text style={styles.excerpt}>{post.excerpt}</Text>}

        {post.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {post.content && (
          <View style={styles.contentWrap}>
            <RenderHtml
              contentWidth={contentWidth}
              source={{ html: post.content }}
              tagsStyles={tagsMap}
              enableExperimentalBRCollapsing
              enableExperimentalGhostLinesPrevention
              enableExperimentalMarginCollapsing
            />
          </View>
        )}

        <View style={{ height: spacing.tabBarPadding }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  coverImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gallery,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: `${colors.mainBlue}14`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.mainBlue,
    fontWeight: '600',
  },
  dateText: {
    ...typography.caption,
    color: colors.raven,
  },
  title: {
    ...typography.h2,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  excerpt: {
    ...typography.body,
    color: colors.raven,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  tagPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  tagPillText: {
    ...typography.caption,
    color: colors.raven,
  },
  contentWrap: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: spacing.md,
  },
  errorDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default BlogPostScreen;
