import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';

import { colors, spacing, typography, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(SCREEN_WIDTH - spacing.lg * 4, 280);
const CENTER_X = GAUGE_SIZE / 2;
const CENTER_Y = GAUGE_SIZE / 2;
const OUTER_RADIUS = GAUGE_SIZE / 2 - 10;
const INNER_RADIUS = OUTER_RADIUS - 24;
const NEEDLE_LENGTH = INNER_RADIUS - 10;

// Match web proportions exactly - values represent BMI range widths from 0
const BMI_CATEGORIES = [
  { label: 'Underweight', maxBmi: 18.5, value: 18.5, color: colors.havelockBlue },
  { label: 'Normal', maxBmi: 25, value: 6.5, color: colors.lima },
  { label: 'Overweight', maxBmi: 30, value: 5, color: '#FFD700' },
  { label: 'Obesity Type 1', maxBmi: 35, value: 5, color: colors.mainOrange },
  { label: 'Obesity Type 2', maxBmi: 40, value: 5, color: '#E53935' },
  { label: 'Obesity Type 3', maxBmi: 45, value: 5, color: '#B71C1C' },
];

const TOTAL_VALUE = BMI_CATEGORIES.reduce((sum, cat) => sum + cat.value, 0);
const MIN_BMI = 0;
const MAX_BMI = 45;

// Get category color from label
const getCategoryColor = (categoryLabel) => {
  const cat = BMI_CATEGORIES.find((c) => c.label === categoryLabel);
  return cat?.color || colors.raven;
};

// Convert polar coordinates to cartesian
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Create arc path for a segment
const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
  const start1 = polarToCartesian(CENTER_X, CENTER_Y, outerRadius, startAngle);
  const end1 = polarToCartesian(CENTER_X, CENTER_Y, outerRadius, endAngle);
  const start2 = polarToCartesian(CENTER_X, CENTER_Y, innerRadius, endAngle);
  const end2 = polarToCartesian(CENTER_X, CENTER_Y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `
    M ${start1.x} ${start1.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end1.x} ${end1.y}
    L ${start2.x} ${start2.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${end2.x} ${end2.y}
    Z
  `;
};

// BMI Gauge component
const BmiGauge = ({ bmi }) => {
  // Calculate needle angle (0-180 degrees, where 0 is left, 180 is right)
  const needleAngle = useMemo(() => {
    if (!bmi) return 90;
    const clampedBmi = Math.min(Math.max(bmi, MIN_BMI), MAX_BMI);
    const normalizedValue = (clampedBmi - MIN_BMI) / (MAX_BMI - MIN_BMI);
    return normalizedValue * 180;
  }, [bmi]);

  // Calculate arc segments
  const segments = useMemo(() => {
    const result = [];
    let currentAngle = 0;

    BMI_CATEGORIES.forEach((cat) => {
      const segmentAngle = (cat.value / TOTAL_VALUE) * 180;
      result.push({
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle,
      });
      currentAngle += segmentAngle;
    });

    return result;
  }, []);

  // Calculate needle position
  const needleEnd = polarToCartesian(CENTER_X, CENTER_Y, NEEDLE_LENGTH, needleAngle);

  return (
    <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + 15}>
      <G>
        {/* Arc segments */}
        {segments.map((segment, index) => (
          <Path
            key={index}
            d={createArc(segment.startAngle, segment.endAngle, INNER_RADIUS, OUTER_RADIUS)}
            fill={segment.color}
          />
        ))}

        {/* Needle */}
        <G>
          <Path
            d={`M ${CENTER_X} ${CENTER_Y} L ${needleEnd.x} ${needleEnd.y}`}
            stroke={colors.mainOrange}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Circle cx={CENTER_X} cy={CENTER_Y} r={8} fill={colors.mainOrange} />
          <Circle cx={CENTER_X} cy={CENTER_Y} r={4} fill={colors.white} />
        </G>

        {/* Min/Max labels */}
        <SvgText x={20} y={CENTER_Y + 15} textAnchor="start" fontSize={10} fill={colors.raven}>
          0
        </SvgText>
        <SvgText x={GAUGE_SIZE - 20} y={CENTER_Y + 15} textAnchor="end" fontSize={10} fill={colors.raven}>
          45
        </SvgText>
      </G>
    </Svg>
  );
};

/**
 * BmiCard component
 * 
 * Props:
 * - bmiData: Object from backend containing { raw, adjusted, category, calculatedAt }
 * - bodyComposition: Object with { type, bodyFat, muscleMass }
 */
const BmiCard = ({ bmiData, bodyComposition }) => {
  const displayBmi = bmiData?.adjusted;
  const category = bmiData?.category;
  const categoryColor = category ? getCategoryColor(category) : colors.raven;
  const message = bmiData?.message;

  // Show raw vs adjusted if there's a meaningful difference
  const showAdjustmentNote = bmiData?.raw && bmiData?.adjusted && 
    Math.abs(bmiData.raw - bmiData.adjusted) > 0.1;

  // Empty state
  if (!displayBmi) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="body-outline" size={32} color={colors.raven} />
          <Text style={styles.emptyTitle}>BMI Calculator</Text>
          <Text style={styles.emptyDescription}>
            Add your weight and height in your profile to calculate your BMI
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Ionicons name="body-outline" size={20} color={categoryColor} />
          </View>
          <Text style={styles.title}>BMI</Text>
        </View>
        <View style={[styles.bmiValueBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.bmiValueText, { color: categoryColor }]}>
            {displayBmi?.toFixed(1) || '--'}
          </Text>
        </View>
      </View>

      {/* Show adjustment note if BMI was adjusted for body composition */}
      {showAdjustmentNote && (
        <View style={styles.adjustmentNote}>
          <Ionicons name="fitness-outline" size={12} color={colors.raven} />
          <Text style={styles.adjustmentNoteText}>
            Adjusted for body composition (raw: {bmiData.raw?.toFixed(1)})
          </Text>
        </View>
      )}

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <BmiGauge bmi={displayBmi} />
      </View>

      {/* Category Label */}
      {category && (
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>{category}</Text>
        </View>
      )}

      {/* Message */}
      {message && (
        <View style={styles.descriptionContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.raven} />
          <Text style={styles.descriptionText}>{message}</Text>
        </View>
      )}

      {/* Body composition if available */}
      {bodyComposition && (bodyComposition.bodyFat || bodyComposition.muscleMass) && (
        <View style={styles.bodyCompRow}>
          {bodyComposition.bodyFat && (
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Body Fat</Text>
              <Text style={styles.bodyCompValue}>{bodyComposition.bodyFat}%</Text>
            </View>
          )}
          {bodyComposition.muscleMass && (
            <View style={styles.bodyCompItem}>
              <Text style={styles.bodyCompLabel}>Muscle Mass</Text>
              <Text style={styles.bodyCompValue}>{bodyComposition.muscleMass}%</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  bmiValueBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  bmiValueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  adjustmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  adjustmentNoteText: {
    ...typography.caption,
    color: colors.raven,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  categoryText: {
    ...typography.body,
    fontWeight: '600',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  descriptionText: {
    ...typography.caption,
    color: colors.raven,
    flex: 1,
    marginLeft: spacing.xs,
    lineHeight: 18,
  },
  bodyCompRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  bodyCompItem: {
    flex: 1,
    alignItems: 'center',
  },
  bodyCompLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  bodyCompValue: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
  },
});

export default BmiCard;
