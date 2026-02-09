import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import { colors } from "../../theme";

const DEFAULT_SLIDER_LENGTH = 280;
const MARKER_OFFSET_Y = 2;

/**
 * Reusable range slider with a single track and two thumbs (min/max).
 * Uses @ptomasroos/react-native-multi-slider for smooth native-feel gestures.
 *
 * @param {number} minimumValue - Minimum value
 * @param {number} maximumValue - Maximum value
 * @param {number} step - Step increment
 * @param {[number, number]} value - [min, max] current value
 * @param {([number, number]) => void} onValueChange - Called with [min, max] when the user releases a thumb (drag end)
 * @param {string} minimumTrackTintColor - Color of track between thumbs
 * @param {string} maximumTrackTintColor - Color of track outside selection
 * @param {string} thumbTintColor - Color of thumbs
 * @param {Object} style - Container style
 */
const RangeSlider = ({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  value = [minimumValue, maximumValue],
  onValueChange,
  minimumTrackTintColor = colors.mainOrange,
  maximumTrackTintColor = colors.gallery,
  thumbTintColor = colors.mainOrange,
  style,
}) => {
  const [sliderLength, setSliderLength] = useState(DEFAULT_SLIDER_LENGTH);
  const [minVal, maxVal] = value;

  const onLayout = useCallback((e) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setSliderLength(width);
    }
  }, []);

  const handleValuesChangeFinish = useCallback(
    (values) => {
      const [a, b] = values;
      const orderedMin = Math.min(a, b);
      const orderedMax = Math.max(a, b);
      onValueChange?.([orderedMin, orderedMax]);
    },
    [onValueChange],
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <MultiSlider
        values={[minVal, maxVal]}
        min={minimumValue}
        max={maximumValue}
        step={step}
        sliderLength={sliderLength}
        onValuesChangeFinish={handleValuesChangeFinish}
        selectedStyle={[
          styles.selectedTrack,
          { backgroundColor: minimumTrackTintColor },
        ]}
        unselectedStyle={[
          styles.unselectedTrack,
          { backgroundColor: maximumTrackTintColor },
        ]}
        trackStyle={styles.track}
        markerStyle={[
          styles.marker,
          {
            backgroundColor: colors.white,
            borderWidth: 2,
            borderColor: thumbTintColor,
          },
        ]}
        containerStyle={styles.sliderContainer}
        touchDimensions={{
          height: 40,
          width: 40,
          borderRadius: 20,
          slipDisplacement: 200,
        }}
        markerOffsetY={MARKER_OFFSET_Y}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 48,
    justifyContent: "center",
  },
  sliderContainer: {
    height: 32,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  selectedTrack: {
    height: 4,
    borderRadius: 2,
  },
  unselectedTrack: {
    height: 4,
    borderRadius: 2,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default RangeSlider;
