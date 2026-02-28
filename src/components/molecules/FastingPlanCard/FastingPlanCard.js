import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FastingPlanCard = ({ _id, title, fastingTime, feedingWindow, description, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const totalHours = fastingTime + feedingWindow;
  const fastingPercent = (fastingTime / totalHours) * 100;
  const feedingPercent = (feedingWindow / totalHours) * 100;

  const handleSelect = useCallback(() => {
    onSelect?.(_id);
  }, [_id, onSelect]);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const cleanDescription = description
    ? description.replace(/<[^>]*>/g, '').trim()
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={handleSelect}
      activeOpacity={0.7}
    >
      {selected && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>Selected</Text>
        </View>
      )}

      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>

      <View style={styles.timelineBar}>
        <View style={[styles.fastingSegment, { width: `${fastingPercent}%` }]}>
          <Text style={styles.segmentLabel}>Fast: {fastingTime}h</Text>
        </View>
        <View style={[styles.feedingSegment, { width: `${feedingPercent}%` }]}>
          <Text style={styles.segmentLabel}>Eat: {feedingWindow}h</Text>
        </View>
      </View>

      {cleanDescription ? (
        <>
          <TouchableOpacity style={styles.toggle} onPress={toggleExpand} activeOpacity={0.7}>
            <Text style={styles.toggleText}>{expanded ? 'Hide details' : 'Show details'}</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.mainBlue}
            />
          </TouchableOpacity>

          {expanded && <Text style={styles.description}>{cleanDescription}</Text>}
        </>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gallery,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}06`,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ribbon: {
    position: 'absolute',
    top: 14,
    right: -2,
    backgroundColor: colors.mainOrange,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ribbonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
    fontSize: 11,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
    textAlign: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.alto,
    marginBottom: spacing.md,
  },
  titleSelected: {
    color: colors.mainOrange,
  },
  timelineBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  fastingSegment: {
    backgroundColor: colors.mainBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  feedingSegment: {
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentLabel: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.alto,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.mainBlue,
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginTop: spacing.md,
  },
});

export default FastingPlanCard;
