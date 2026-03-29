import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { useGetFaqsQuery } from '../../store/api';

const FaqTab = () => {
  const { data: faqs, isLoading } = useGetFaqsQuery();
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </View>
    );
  }

  if (!faqs?.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="help-circle-outline" size={48} color={colors.gallery} />
        <Text style={styles.emptyTitle}>No FAQs available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {faqs.map((faq) => {
        const isOpen = expandedId === faq._id;
        return (
          <TouchableOpacity
            key={faq._id}
            style={styles.faqCard}
            onPress={() => setExpandedId(isOpen ? null : faq._id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.raven}
              />
            </View>
            {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },
  centered: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.raven,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.raven,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});

export default FaqTab;
