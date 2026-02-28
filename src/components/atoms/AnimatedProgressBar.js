import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '../../theme';

const TRACK_HEIGHT = 12;

const AnimatedProgressBar = ({ progress, currentStep, totalSteps }) => {
  const computedProgress = progress != null
    ? progress
    : Math.min(currentStep / totalSteps, 1);
  const [trackWidth, setTrackWidth] = useState(0);

  const widthAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = useCallback((e) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (!trackWidth) return;
    Animated.timing(widthAnim, {
      toValue: computedProgress * trackWidth,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [computedProgress, trackWidth, widthAnim]);

  return (
    <View style={styles.container}>
      {currentStep != null && totalSteps != null && (
        <Text style={styles.label}>
          Step <Text style={styles.labelHighlight}>{currentStep}</Text> of{' '}
          <Text style={styles.labelHighlight}>{totalSteps}</Text>
        </Text>
      )}

      <View style={styles.track} onLayout={handleLayout}>
        <Animated.View style={[styles.fillWrap, { width: widthAnim }]}>
          <LinearGradient
            colors={[colors.mainOrange, colors.salmon]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.raven,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  labelHighlight: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.athensGray,
    borderWidth: 1,
    borderColor: `${colors.mainOrange}30`,
    overflow: 'hidden',
  },
  fillWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TRACK_HEIGHT / 2,
  },
});

export default AnimatedProgressBar;
