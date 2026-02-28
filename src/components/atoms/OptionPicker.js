import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography, borderRadius } from "../../theme";

const OptionCard = ({ label, active, onPress }) => {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [active, anim]);

  const checkOpacity = anim;
  const checkTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, -4],
  });
  const textTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.checkBadge,
          {
            opacity: checkOpacity,
            transform: [{ translateY: checkTranslateY }],
          },
        ]}
      >
        <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.cardText,
          active && styles.cardTextActive,
          { transform: [{ translateY: textTranslateY }] },
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const OptionPicker = ({
  options = [],
  value,
  onChange,
  multiple = false,
  showNone = false,
  showOther = false,
  otherSelected = false,
  onOtherToggle,
  onNone,
}) => {
  const isSelected = useCallback(
    (optionValue) => {
      if (multiple) return Array.isArray(value) && value.includes(optionValue);
      return value === optionValue;
    },
    [value, multiple],
  );

  const handlePress = useCallback(
    (optionValue) => {
      if (multiple) {
        const arr = Array.isArray(value) ? value : [];
        const next = arr.includes(optionValue)
          ? arr.filter((v) => v !== optionValue)
          : [...arr, optionValue];
        onChange?.(next);
      } else {
        onChange?.(optionValue);
      }
    },
    [value, multiple, onChange],
  );

  const handleNone = useCallback(() => {
    onChange?.(multiple ? [] : "");
    onNone?.();
  }, [multiple, onChange, onNone]);

  const handleOther = useCallback(() => {
    onOtherToggle?.(!otherSelected);
  }, [otherSelected, onOtherToggle]);

  const noneActive =
    (multiple ? Array.isArray(value) && value.length === 0 : !value) &&
    !otherSelected;

  return (
    <View style={styles.container}>
      {showNone && (
        <OptionCard label="None" active={noneActive} onPress={handleNone} />
      )}

      {options.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.text}
          active={isSelected(opt.value)}
          onPress={() => handlePress(opt.value)}
        />
      ))}

      {showOther && (
        <OptionCard
          label="Other"
          active={otherSelected}
          onPress={handleOther}
        />
      )}
    </View>
  );
};

const CARD_HEIGHT = 70;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    height: CARD_HEIGHT,
    minWidth: 140,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: "hidden",
  },
  cardActive: {
    backgroundColor: colors.mainOrange,
  },
  checkBadge: {
    alignItems: "center",
    marginBottom: 2,
  },
  cardText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.mainOrange,
    textAlign: "center",
  },
  cardTextActive: {
    color: colors.white,
  },
});

export default OptionPicker;
