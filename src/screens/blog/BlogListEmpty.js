import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../../theme';

const BlogListEmpty = ({ isFetching, hasActiveFilters }) => {
  if (isFetching) return null;

  return (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={48} color={colors.mercury} />
      <Text style={styles.emptyTitle}>No posts found</Text>
      <Text style={styles.emptyDescription}>
        {hasActiveFilters ? 'Try adjusting your filters or search.' : 'Check back later for new content.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: spacing.md,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default BlogListEmpty;
