import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const RecommendationItem = ({ recommendation, index }) => (
  <View style={styles.item}>
    <View style={styles.number}>
      <Text style={styles.numberText}>{index + 1}</Text>
    </View>
    <Text style={styles.text}>{recommendation}</Text>
  </View>
);

/**
 * Personalized Recommendations section for Plan screen
 */
const RecommendationsSection = ({ recommendations }) => {
  // Handle both array and object formats
  let items = [];
  
  if (Array.isArray(recommendations)) {
    items = recommendations;
  } else if (recommendations && typeof recommendations === 'object') {
    // If recommendations is an object, try to extract arrays from it
    items = recommendations.tips || recommendations.general || recommendations.items || [];
  }

  if (!items || items.length === 0) return null;

  return (
    <SectionCard title="Personalized Recommendations" icon="bulb-outline" color={colors.mainOrange}>
      {items.map((rec, index) => (
        <RecommendationItem key={index} recommendation={typeof rec === 'string' ? rec : rec.text || rec.recommendation} index={index} />
      ))}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.mainOrange}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  numberText: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '600',
  },
  text: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
});

export default RecommendationsSection;
