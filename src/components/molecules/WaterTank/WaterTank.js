import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors, spacing, typography, borderRadius } from "../../../theme";

// Web WaveSvg exact paths (viewBox 0 0 560 20)
const WAVE_VIEWBOX = { width: 560, height: 20 };
const WAVE_PATHS = [
  "M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z",
  "M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z",
  "M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z",
  "M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z",
];

const WAVE_WIDTH = 560;
const WAVE_DOUBLE_WIDTH = WAVE_WIDTH * 2;
const WAVE_HEIGHT = 24;
const BUBBLE_DURATION = 750;

const WaterTank = ({
  displayValue,
  displayUnit,
  fillPercent = 40,
  animated: bubbleAnimated = false,
}) => {
  const waveBackX = useRef(new Animated.Value(0)).current;
  const waveFrontX = useRef(new Animated.Value(0)).current;
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  const percent = Math.min(65, Math.max(25, fillPercent));

  useEffect(() => {
    const back = Animated.loop(
      Animated.timing(waveBackX, {
        toValue: WAVE_WIDTH,
        duration: 1800,
        useNativeDriver: true,
      }),
    );
    const front = Animated.loop(
      Animated.timing(waveFrontX, {
        toValue: -WAVE_WIDTH,
        duration: 1100,
        useNativeDriver: true,
      }),
    );
    back.start();
    front.start();
    return () => {
      back.stop();
      front.stop();
    };
  }, [waveBackX, waveFrontX]);

  const runBubbles = useCallback(() => {
    bubble1.setValue(0);
    bubble2.setValue(0);
    bubble3.setValue(0);
    Animated.parallel([
      Animated.timing(bubble1, {
        toValue: 1,
        duration: BUBBLE_DURATION,
        useNativeDriver: true,
        delay: 0,
      }),
      Animated.timing(bubble2, {
        toValue: 1,
        duration: BUBBLE_DURATION,
        useNativeDriver: true,
        delay: 100,
      }),
      Animated.timing(bubble3, {
        toValue: 1,
        duration: BUBBLE_DURATION,
        useNativeDriver: true,
        delay: 150,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        bubble1.setValue(0);
        bubble2.setValue(0);
        bubble3.setValue(0);
      }
    });
  }, [bubble1, bubble2, bubble3]);

  useEffect(() => {
    if (bubbleAnimated) runBubbles();
  }, [bubbleAnimated, runBubbles]);

  const renderWaveSvg = (fillColor) => (
    <Svg
      width={WAVE_DOUBLE_WIDTH}
      height={WAVE_HEIGHT}
      viewBox={`0 0 ${WAVE_VIEWBOX.width} ${WAVE_VIEWBOX.height}`}
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      {WAVE_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={fillColor} />
      ))}
    </Svg>
  );

  return (
    <View style={styles.tank}>
      <View style={styles.value}>
        <Text style={styles.amount}>{displayValue}</Text>
        <Text style={styles.unit}>{displayUnit}</Text>
      </View>

      <View style={[styles.water, { height: `${percent}%` }]}>
        <View style={styles.waterInner}>
          <View style={styles.waveRow}>
            <Animated.View
              style={[
                styles.waveWrapBack,
                { transform: [{ translateX: waveBackX }] },
              ]}
            >
              {renderWaveSvg(colors.mariner)}
            </Animated.View>
          </View>
          <View style={[styles.waveRow, styles.waveFrontRow]}>
            <Animated.View
              style={[
                styles.waveWrapFront,
                { transform: [{ translateX: waveFrontX }] },
              ]}
            >
              {renderWaveSvg(colors.lightBlue)}
            </Animated.View>
          </View>

          <View style={[styles.bubbles, { pointerEvents: "none" }]}>
            <Animated.View
              style={[
                styles.bubble,
                {
                  opacity: bubble1.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      scale: bubble1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: bubble1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -90],
                      }),
                    },
                    {
                      translateX: bubble1.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 15, 5],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bubble,
                styles.bubble2,
                {
                  opacity: bubble2.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      scale: bubble2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: bubble2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -90],
                      }),
                    },
                    {
                      translateX: bubble2.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -10, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bubble,
                styles.bubble3,
                {
                  opacity: bubble3.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      scale: bubble3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: bubble3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -90],
                      }),
                    },
                    {
                      translateX: bubble3.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -5, 5],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tank: {
    minHeight: 160,
    maxWidth: 200,
    backgroundColor: colors.mainBlue,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  value: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  amount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 32,
  },
  unit: {
    fontSize: 11,
    letterSpacing: 0.12,
    color: colors.gallery,
    marginTop: 2,
    textTransform: "uppercase",
  },
  water: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  waterInner: {
    ...StyleSheet.absoluteFillObject,
  },
  waveRow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: WAVE_HEIGHT,
    top: 0,
    overflow: "hidden",
  },
  waveFrontRow: {
    marginTop: -1,
  },
  waveWrapBack: {
    position: "absolute",
    top: 0,
    right: 0,
    width: WAVE_DOUBLE_WIDTH,
    height: WAVE_HEIGHT,
  },
  waveWrapFront: {
    position: "absolute",
    top: 0,
    left: 0,
    width: WAVE_DOUBLE_WIDTH,
    height: WAVE_HEIGHT,
  },
  bubbles: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
  },
  bubble: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    bottom: 0,
    left: "50%",
    marginLeft: -10,
  },
  bubble2: {
    marginLeft: -20,
  },
  bubble3: {
    marginLeft: 0,
  },
});

export default WaterTank;
