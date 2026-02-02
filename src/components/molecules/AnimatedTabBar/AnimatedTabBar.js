import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_ICONS = {
  HomeTab: 'home',
  RecipesTab: 'restaurant',
  TrackingTab: 'stats-chart',
  PlanTab: 'map',
  WorkoutTab: 'barbell',
  ProfileTab: 'person',
};

const HOME_TAB_NAME = 'HomeTab';

const TAB_BAR_HEIGHT = 50;
const CORNER_RADIUS = 16;
const CUTOUT_RADIUS = 36;

const generateTabBarPath = (width, height) => {
  const cutoutCenterX = width / 2;
  const cutoutLeftX = cutoutCenterX - CUTOUT_RADIUS;
  const cutoutRightX = cutoutCenterX + CUTOUT_RADIUS;
  
  return `
    M0,${height}
    L0,${CORNER_RADIUS} 
    Q0,0 ${CORNER_RADIUS},0
    L${cutoutLeftX},0
    A${CUTOUT_RADIUS},${CUTOUT_RADIUS} 0 0 0 ${cutoutRightX},0
    L${width - CORNER_RADIUS},0 
    Q${width},0 ${width},${CORNER_RADIUS}
    L${width},${height}
    Z
  `;
};

const TabBarButton = ({ route, index, state, descriptors, navigation }) => {
  const { options } = descriptors[route.key];
  const label = options.tabBarLabel ?? options.title ?? route.name;
  const isFocused = state.index === index;
  const isHome = route.name === HOME_TAB_NAME;

  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;

  const iconName = TAB_ICONS[route.name] || 'ellipse';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, opacityAnim]);

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  if (isHome) {
    return (
      <View style={styles.homeTabWrapper}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.homeButtonTouchable}
        >
          <Animated.View 
            style={[
              styles.homeButton, 
              isFocused && styles.homeButtonActive
            ]}
          >
            <Ionicons
              name={isFocused ? iconName : `${iconName}-outline`}
              size={30}
              color={isFocused ? colors.white : colors.mainOrange}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.iconWrapper]}>
        <View style={[styles.iconBackground, isFocused && styles.iconBackgroundActive]}>
          <Ionicons
            name={isFocused ? iconName : `${iconName}-outline`}
            size={30}
            color={isFocused ? colors.mainOrange : colors.raven}
          />
        </View>
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: isFocused ? colors.mainOrange : colors.raven },
          { opacity: opacityAnim },
        ]}
      >
        {label.replace('Tab', '')}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  const bottomInset = insets.bottom;
  const totalHeight = TAB_BAR_HEIGHT + bottomInset;
  const svgPath = generateTabBarPath(SCREEN_WIDTH, totalHeight);

  // Filter out routes that have tabBarButton set to null (hidden tabs)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarButton !== null && typeof options.tabBarButton !== 'function';
  });

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <Svg width={SCREEN_WIDTH} height={totalHeight} style={styles.svg}>
        <Path d={svgPath} fill={colors.white} />
      </Svg>

      <View style={styles.tabsContainer}>
        {visibleRoutes.map((route) => {
          // Find the original index in state.routes for focus detection
          const originalIndex = state.routes.findIndex((r) => r.key === route.key);
          return (
            <TabBarButton
              key={route.key}
              route={route}
              index={originalIndex}
              state={state}
              descriptors={descriptors}
              navigation={navigation}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 2,
  },
  iconBackground: {
    width: 48,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackgroundActive: {
    backgroundColor: `${colors.mainOrange}15`,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  homeTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  homeButtonTouchable: {
    marginTop: -46,
  },
  homeButton: {
    width: 64,
    height: 64,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.mainOrange,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  homeButtonActive: {
    backgroundColor: colors.mainOrange,
  },
});

export default AnimatedTabBar;
