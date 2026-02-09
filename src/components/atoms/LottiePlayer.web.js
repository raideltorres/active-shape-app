import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Web stub for LottiePlayer. lottie-react-native on web requires @lottiefiles/dotlottie-react.
 * This avoids pulling that dependency; renders an empty placeholder so layout is preserved.
 */
const LottiePlayer = ({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  size = 100,
  style,
}) => {
  if (!source) return null;
  return <View style={[styles.container, { width: size, height: size }, style]} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default React.memo(LottiePlayer);
