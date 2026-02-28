import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import { colors, spacing, typography, borderRadius } from '../../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const calculateFeedingWindow = (fastingHours, fw) => {
  if (fw != null && fw > 0) return fw;
  if (fastingHours >= 24) return 24;
  return 24 - fastingHours;
};

const getTimeMarkers = (totalHours) => {
  if (totalHours <= 24) return ['12 AM', '6 AM', '12 PM', '6 PM', '12 AM'];
  if (totalHours <= 48) return ['Day 1', '12h', 'Day 2', '12h', 'Day 3'];
  const days = Math.ceil(totalHours / 24);
  return Array.from({ length: days + 1 }, (_, i) => `Day ${i + 1}`);
};

const CIRCLE_SIZE = 130;
const RIM_SIZE = 8;
const OUTER_SIZE = CIRCLE_SIZE + RIM_SIZE * 2;

const BenefitCircle = ({ text, index }) => {
  const isOdd = index % 2 === 0;
  const ringColor = isOdd ? colors.mainOrange : colors.mainBlue;
  const outerRadius = (OUTER_SIZE - RIM_SIZE) / 2;
  const outerCenter = OUTER_SIZE / 2;
  const circumference = 2 * Math.PI * outerRadius;
  const halfCircumference = circumference / 2;

  return (
    <View style={circleStyles.wrapper}>
      <Svg width={OUTER_SIZE} height={OUTER_SIZE} style={circleStyles.svg}>
        <SvgCircle
          cx={outerCenter}
          cy={outerCenter}
          r={outerRadius}
          stroke={ringColor}
          strokeWidth={RIM_SIZE}
          fill="none"
          strokeDasharray={`${halfCircumference} ${halfCircumference}`}
          rotation={isOdd ? 90 : -90}
          origin={`${outerCenter}, ${outerCenter}`}
        />
      </Svg>
      <View
        style={[
          circleStyles.inner,
          {
            shadowOffset: { width: isOdd ? 2 : -2, height: 0 },
          },
        ]}
      >
        <Text style={circleStyles.text}>{text}</Text>
      </View>
    </View>
  );
};

const innerSize = CIRCLE_SIZE;

const circleStyles = StyleSheet.create({
  wrapper: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -(RIM_SIZE / 2),
  },
  svg: {
    position: 'absolute',
  },
  inner: {
    width: innerSize,
    height: innerSize,
    borderRadius: innerSize / 2,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 17,
  },
});

const extractTextFromTNode = (tnode) => {
  if (tnode.type === 'text') return tnode.data || '';
  if (tnode.children) return tnode.children.map(extractTextFromTNode).join('');
  return '';
};

const CircleListRenderer = ({ tnode }) => {
  const items = (tnode.children || [])
    .filter((c) => c.tagName === 'li')
    .map((li) => extractTextFromTNode(li).trim())
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
      {items.map((item, i) => (
        <BenefitCircle key={i} text={item} index={i} />
      ))}
    </View>
  );
};

const renderers = {
  ul: ({ tnode, TDefaultRenderer, ...props }) => {
    const classList = tnode.attributes?.class || '';
    if (classList.includes('circle-list')) {
      return <CircleListRenderer tnode={tnode} />;
    }
    return <TDefaultRenderer tnode={tnode} {...props} />;
  },
};

const htmlTagsStyles = {
  body: { color: colors.raven, fontSize: 14, lineHeight: 22 },
  p: { marginVertical: 4 },
  h3: { color: colors.mineShaft, fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 4 },
  h4: { color: colors.mineShaft, fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 4 },
  strong: { color: colors.mineShaft, fontWeight: '700' },
  b: { color: colors.mineShaft, fontWeight: '700' },
  ul: { paddingLeft: 8, marginVertical: 4 },
  li: { marginVertical: 2 },
};

const FastingPlanCard = ({ _id, title, fastingTime, feedingWindow, description, selected, onSelect }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const actualFeedingWindow = calculateFeedingWindow(fastingTime, feedingWindow);
  const totalHours = fastingTime + actualFeedingWindow;
  const fastingPercent = (fastingTime / totalHours) * 100;
  const feedingPercent = (actualFeedingWindow / totalHours) * 100;
  const timeMarkers = useMemo(() => getTimeMarkers(totalHours), [totalHours]);

  const handleSelect = useCallback(() => {
    onSelect?.(_id);
  }, [_id, onSelect]);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const hasDescription = description && description.trim().length > 0;
  const contentWidth = screenWidth - spacing.lg * 2 - spacing.md * 2 - 4;

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
        <View style={[styles.fastingSegment, { flex: fastingPercent }]}>
          <Text style={styles.segmentLabel}>Fast: {fastingTime}h</Text>
        </View>
        <View style={[styles.feedingSegment, { flex: feedingPercent }]}>
          <Text style={styles.segmentLabel}>Eat: {actualFeedingWindow}h</Text>
        </View>
      </View>

      <View style={styles.markers}>
        {timeMarkers.map((marker, i) => (
          <Text key={i} style={styles.markerText}>{marker}</Text>
        ))}
      </View>

      {hasDescription && (
        <>
          <TouchableOpacity style={styles.toggle} onPress={toggleExpand} activeOpacity={0.7}>
            <Text style={styles.toggleText}>{expanded ? 'Hide details' : 'Show details'}</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.mainBlue}
            />
          </TouchableOpacity>

          {expanded && (
            <View style={styles.descriptionWrap}>
              <RenderHtml
                contentWidth={contentWidth}
                source={{ html: description }}
                tagsStyles={htmlTagsStyles}
                renderers={renderers}
              />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
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
    width: '100%',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fastingSegment: {
    backgroundColor: colors.mainBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedingSegment: {
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentLabel: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  markers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.slateGray,
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
  descriptionWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.alto,
  },
});

export default FastingPlanCard;
