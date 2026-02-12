import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Card from "../Card";
import WaterTank from "../WaterTank";
import { colors, spacing, typography, borderRadius } from "../../../theme";

const DRINK_OPTIONS = [
  {
    id: "glass",
    amount: 250,
    label: "Glass",
    helper: "A standard drinking glass.",
  },
  {
    id: "bottle",
    amount: 500,
    label: "Bottle",
    helper: "Standard water bottle.",
  },
  {
    id: "large-bottle",
    amount: 1000,
    label: "Large Bottle",
    helper: "Extra large bottle.",
    displayAmount: "1 L",
  },
  {
    id: "jug",
    amount: 2000,
    label: "Jug",
    helper: "Large water jug.",
    displayAmount: "2 L",
  },
];

const TANK_CAPACITY_ML = 2000;

const formatVolume = (ml) => {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return `${Number.isInteger(liters) ? liters : liters.toFixed(1)} L`;
  }
  return `${ml} ml`;
};

const WaterIntakeSelector = ({
  totalConsumed = 0,
  dailyGoalLiters = 2.5,
  onDrink,
  loading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(DRINK_OPTIONS[0]);
  const [bubbleAnimated, setBubbleAnimated] = useState(false);
  const timeoutRef = useRef(null);

  const dailyGoalMl = dailyGoalLiters * 1000;
  const goalCoverage = Math.min(100, Math.round((totalConsumed / dailyGoalMl) * 100));

  const fillPercent = Math.min(
    65,
    Math.max(25, (selectedOption.amount / TANK_CAPACITY_ML) * 100),
  );
  const displayValue =
    selectedOption.amount >= 1000
      ? (selectedOption.amount / 1000).toFixed(1)
      : String(selectedOption.amount);
  const displayUnit = selectedOption.amount >= 1000 ? "liters" : "milliliters";

  const triggerBubbles = useCallback(() => {
    setBubbleAnimated(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBubbleAnimated(false), 400);
  }, []);

  const handleOptionSelect = useCallback(
    (option) => {
      setSelectedOption(option);
      triggerBubbles();
    },
    [triggerBubbles],
  );

  const handleDrink = useCallback(() => {
    triggerBubbles();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onDrink?.(selectedOption.amount);
    }, 800);
  }, [selectedOption, onDrink, triggerBubbles]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.cardTitle}>Water Intake</Text>
        <Text style={styles.description}>
          Stay hydrated by tracking your water intake. A daily goal of 2–3
          liters is a good starting point—adjust based on your activity level
          and climate.
        </Text>

        <View style={styles.orangeDivider} />

        <View style={styles.goalCard}>
          <View style={styles.goalCardLeft}>
            <Text style={styles.goalCardLabel}>DAILY GOAL COVERAGE</Text>
            <Text style={styles.goalCardText}>
              {formatVolume(totalConsumed)} of {formatVolume(dailyGoalMl)} goal
            </Text>
          </View>
          <Text style={styles.goalCardPercent}>{goalCoverage}%</Text>
        </View>

        <Text style={styles.chooseLabel}>Choose your drink size</Text>
        <Text style={styles.chooseHint}>Select the amount you just consumed.</Text>

        <View style={styles.tankAndGridRow}>
          <View style={styles.tankWrap}>
            <WaterTank
              displayValue={displayValue}
              displayUnit={displayUnit}
              fillPercent={fillPercent}
              animated={bubbleAnimated}
            />
          </View>
          <View style={styles.grid}>
            {DRINK_OPTIONS.map((option) => {
              const isSelected = selectedOption.id === option.id;
              const displayVal =
                option.displayAmount ||
                (option.amount >= 1000
                  ? `${option.amount / 1000} L`
                  : `${option.amount} ml`);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.gridItem,
                    isSelected && styles.gridItemSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.checkWrap}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.havelockBlue}
                      />
                    </View>
                  )}
                  <Text style={styles.gridAmount}>{displayVal}</Text>
                  <Text style={styles.gridLabel}>{option.label}</Text>
                  <Text style={styles.gridHelper} numberOfLines={2}>
                    {option.helper}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.drinkButton}
          onPress={handleDrink}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons
            name="water"
            size={20}
            color={colors.white}
            style={styles.drinkIcon}
          />
          <Text style={styles.drinkButtonText}>Drink</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>
          Tip: aim for 6–8 servings spread evenly across your day.
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  cardTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  orangeDivider: {
    height: 2,
    backgroundColor: colors.mainOrange,
    marginBottom: spacing.lg,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.mercury,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  goalCardLeft: { gap: 6 },
  goalCardLabel: {
    fontSize: 11,
    letterSpacing: 0.08,
    color: colors.raven,
    textTransform: 'uppercase',
  },
  goalCardText: {
    ...typography.bodySmall,
    color: colors.riverBed,
  },
  goalCardPercent: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.mainBlue,
  },
  chooseLabel: {
    ...typography.label,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
    textAlign: "center",
    alignSelf: "stretch",
  },
  chooseHint: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: spacing.sm,
  },
  tankAndGridRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  tankWrap: { alignItems: "center" },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    minWidth: 0,
  },
  gridItem: {
    width: "48%",
    minWidth: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gallery,
    backgroundColor: colors.alabaster,
  },
  gridItemSelected: {
    borderColor: colors.havelockBlue,
    backgroundColor: `${colors.havelockBlue}08`,
  },
  checkWrap: { position: "absolute", top: spacing.xs, right: spacing.xs },
  gridAmount: { ...typography.h4, color: colors.mineShaft, marginBottom: 2 },
  gridLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.mineShaft,
    marginBottom: 2,
  },
  gridHelper: { ...typography.caption, fontSize: 10, color: colors.raven },
  drinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mainOrange,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  drinkIcon: { marginRight: spacing.sm },
  drinkButtonText: { ...typography.button, color: colors.white },
  tip: { ...typography.caption, color: colors.raven, textAlign: "center" },
});

export default WaterIntakeSelector;
