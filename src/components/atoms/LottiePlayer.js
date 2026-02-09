import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * Reusable Lottie animation player component
 * 
 * @param {object} source - Lottie animation JSON (required)
 * @param {boolean} autoPlay - Auto-play animation (default: true)
 * @param {boolean} loop - Loop animation (default: true)
 * @param {number} speed - Animation speed (default: 1)
 * @param {number} size - Width and height of animation (default: 100)
 * @param {object} style - Additional styles
 */
const LottiePlayer = ({ 
  source, 
  autoPlay = true, 
  loop = true, 
  speed = 1, 
  size = 100,
  style,
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  if (!source) return null;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(LottiePlayer);
