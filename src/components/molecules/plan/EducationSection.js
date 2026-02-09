import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from './SectionCard';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// Main explanation card (Why These Goals / The Science)
const ExplanationCard = ({ icon, iconColor, iconBgColor, title, content }) => {
  if (!content) return null;

  return (
    <View style={[styles.explanationCard, { backgroundColor: `${iconBgColor}10` }]}>
      <View style={styles.explanationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={18} color={colors.white} />
        </View>
        <Text style={styles.explanationTitle}>{title}</Text>
      </View>
      <Text style={styles.explanationContent}>{content}</Text>
    </View>
  );
};

// Tips/Mistakes list card
const TipsCard = ({ title, items, icon, iconColor, isWarning }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.tipsCard, isWarning && styles.tipsCardWarning]}>
      <Text style={styles.tipsTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.tipItem}>
          <Ionicons 
            name={icon} 
            size={16} 
            color={iconColor} 
            style={styles.tipIcon}
          />
          <Text style={styles.tipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Education/Understanding Your Plan section for Plan screen
 */
const EducationSection = ({ education }) => {
  if (!education) return null;

  const { whyTheseGoals, scientificBasis, successTips, commonMistakes } = education;

  // Check if we have any content to show
  const hasContent = whyTheseGoals || scientificBasis || 
    (successTips && successTips.length > 0) || 
    (commonMistakes && commonMistakes.length > 0);

  if (!hasContent) return null;

  return (
    <SectionCard title="Understanding Your Plan" icon="school-outline" color={colors.purple}>
      {/* Why These Goals */}
      <ExplanationCard
        icon="bulb-outline"
        iconColor={colors.white}
        iconBgColor="#3b82f6"
        title="Why These Goals?"
        content={whyTheseGoals}
      />

      {/* The Science */}
      <ExplanationCard
        icon="flask-outline"
        iconColor={colors.white}
        iconBgColor="#f59e0b"
        title="The Science"
        content={scientificBasis}
      />

      {/* Tips for Success */}
      <TipsCard
        title="TIPS FOR SUCCESS"
        items={successTips}
        icon="checkmark-circle"
        iconColor="#10b981"
        isWarning={false}
      />

      {/* Avoid These Mistakes */}
      <TipsCard
        title="AVOID THESE MISTAKES"
        items={commonMistakes}
        icon="warning"
        iconColor="#f59e0b"
        isWarning={true}
      />
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  explanationCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  explanationTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    flex: 1,
  },
  explanationContent: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#ecfdf5', // green-50
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tipsCardWarning: {
    backgroundColor: '#fef3c7', // amber-100
  },
  tipsTitle: {
    ...typography.labelUppercase,
    color: colors.raven,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
});

export default EducationSection;
