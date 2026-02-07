import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SectionCard from './SectionCard';
import { colors, spacing, typography } from '../../../theme';

/**
 * Education/Understanding Your Plan section for Plan screen
 */
const EducationSection = ({ education }) => {
  if (!education?.topics || education.topics.length === 0) return null;

  return (
    <SectionCard title="Understanding Your Plan" icon="school-outline" color={colors.purple}>
      {education.topics.map((topic, index) => (
        <View key={index} style={styles.topic}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicContent}>{topic.content}</Text>
        </View>
      ))}
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  topic: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  topicTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  topicContent: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
  },
});

export default EducationSection;
