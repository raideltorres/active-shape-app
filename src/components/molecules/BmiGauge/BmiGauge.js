import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';

import { colors, spacing } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(SCREEN_WIDTH - spacing.lg * 4, 280);
const CENTER_X = GAUGE_SIZE / 2;
const CENTER_Y = GAUGE_SIZE / 2;
const OUTER_RADIUS = GAUGE_SIZE / 2 - 10;
const INNER_RADIUS = OUTER_RADIUS - 24;
const NEEDLE_LENGTH = INNER_RADIUS - 10;

const BMI_CATEGORIES = [
  { label: 'Underweight', value: 18.5, color: colors.havelockBlue },
  { label: 'Normal', value: 6.5, color: colors.lima },
  { label: 'Overweight', value: 5, color: '#FFD700' },
  { label: 'Obesity Type 1', value: 5, color: colors.mainOrange },
  { label: 'Obesity Type 2', value: 5, color: '#E53935' },
  { label: 'Obesity Type 3', value: 5, color: '#B71C1C' },
];

const TOTAL_VALUE = BMI_CATEGORIES.reduce((sum, cat) => sum + cat.value, 0);
const MAX_BMI = 45;

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
  const start1 = polarToCartesian(CENTER_X, CENTER_Y, outerRadius, startAngle);
  const end1 = polarToCartesian(CENTER_X, CENTER_Y, outerRadius, endAngle);
  const start2 = polarToCartesian(CENTER_X, CENTER_Y, innerRadius, endAngle);
  const end2 = polarToCartesian(CENTER_X, CENTER_Y, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start1.x} ${start1.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end1.x} ${end1.y}`,
    `L ${start2.x} ${start2.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${end2.x} ${end2.y}`,
    'Z',
  ].join(' ');
};

const SEGMENTS = (() => {
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
})();

/**
 * Semi-circular BMI gauge with needle — replicates the web's Recharts-based gauge.
 * Uses react-native-svg to render 6 colored arc segments and a needle pointer.
 */
const BmiGauge = ({ bmi }) => {
  const needleAngle = useMemo(() => {
    if (!bmi) return 90;
    const clamped = Math.min(Math.max(bmi, 0), MAX_BMI);
    return (clamped / MAX_BMI) * 180;
  }, [bmi]);

  const needleEnd = polarToCartesian(CENTER_X, CENTER_Y, NEEDLE_LENGTH, needleAngle);

  return (
    <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + 20}>
      <G>
        {SEGMENTS.map((segment, index) => (
          <Path
            key={index}
            d={createArc(segment.startAngle, segment.endAngle, INNER_RADIUS, OUTER_RADIUS)}
            fill={segment.color}
          />
        ))}

        <Path
          d={`M ${CENTER_X} ${CENTER_Y} L ${needleEnd.x} ${needleEnd.y}`}
          stroke={colors.mainOrange}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx={CENTER_X} cy={CENTER_Y} r={8} fill={colors.mainOrange} />
        <Circle cx={CENTER_X} cy={CENTER_Y} r={4} fill={colors.white} />

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

export default BmiGauge;
