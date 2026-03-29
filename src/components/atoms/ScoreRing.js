import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../../theme';

export const getScoreColor = (score) => {
  if (score >= 90) return colors.lima;
  if (score >= 75) return colors.mariner;
  if (score >= 60) return colors.buttercup;
  if (score >= 40) return colors.mainOrange;
  return colors.cinnabar;
};

const ScoreRing = ({ score, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <View style={[styles.scoreRing, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.gallery}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.scoreValue}>
        <Text style={styles.scoreNumber}>{score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.mainBlue,
  },
});

export default ScoreRing;
