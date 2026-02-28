import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import Toast from 'react-native-toast-message';

import Button from "../../components/atoms/Button";
import OptionPicker from "../../components/atoms/OptionPicker";
import ValuePicker from "../../components/molecules/ValuePicker/ValuePicker";
import FastingPlanCard from "../../components/molecules/FastingPlanCard/FastingPlanCard";
import { useGetFastingPlansQuery } from "../../store/api";
import { colors, spacing, typography, borderRadius } from "../../theme";
import {
  calculateGoalWeight,
  fromKgToLbs,
  fromLbsToKg,
  TIMELINE_RANGES,
} from "../../utils/measure";

const FASTING_EXPERIENCE_OPTIONS = [
  { value: "beginner", text: "New to fasting" },
  { value: "occasional", text: "Tried occasionally" },
  { value: "regular", text: "Fast regularly" },
];

const EATING_SCHEDULE_OPTIONS = [
  { value: "morning", text: "Morning eater" },
  { value: "evening", text: "Evening eater" },
  { value: "flexible", text: "Flexible" },
];

const GoalsStep = ({ onSubmit, onBack, profileData, optionsData, loading }) => {
  const savedGoals = profileData?.onboarding?.healthAndFitnessGoals || {};
  const primaryGoalInitialized = useRef(false);

  const [primaryGoal, setPrimaryGoal] = useState(savedGoals.primaryGoal || "");
  const [fitnessPreferences, setFitnessPreferences] = useState(
    savedGoals.fitnessPreferences || [],
  );
  const [goalTimeline, setGoalTimeline] = useState(
    savedGoals.goalTimeline || "",
  );
  const [preferredEatingSchedule, setPreferredEatingSchedule] = useState(
    savedGoals.preferredEatingSchedule || "",
  );
  const [usesIntermittentFasting, setUsesIntermittentFasting] = useState(
    savedGoals.usesIntermittentFasting || false,
  );
  const [fastingExperience, setFastingExperience] = useState(
    savedGoals.fastingExperience || "",
  );
  const [selectedFastingPlan, setSelectedFastingPlan] = useState(
    profileData?.fastingSettings?.fastingPlanId || null,
  );

  const { data: fastingPlansData, isLoading: loadingPlans } =
    useGetFastingPlansQuery(undefined, {
      skip: fastingExperience !== "regular",
    });

  const sortedFastingPlans = useMemo(() => {
    if (!fastingPlansData) return [];
    return [...fastingPlansData].sort((a, b) => a.fastingTime - b.fastingTime);
  }, [fastingPlansData]);

  const primaryGoalOptions = useMemo(() => {
    if (!optionsData?.primaryGoals) return [];
    return optionsData.primaryGoals
      .filter((o) => o.value !== "other")
      .map((o) => ({ value: o.value, text: o.text }));
  }, [optionsData]);

  const fitnessPrefsOptions = useMemo(() => {
    if (!optionsData?.fitnessPreferences) return [];
    return optionsData.fitnessPreferences
      .filter((o) => o.value !== "other")
      .map((o) => ({ value: o.value, text: o.text }));
  }, [optionsData]);

  const autoGoalWeight = useMemo(() => {
    if (!profileData?.weight || !profileData?.height)
      return profileData?.weight || 70;
    return calculateGoalWeight({
      weight: profileData.weight,
      height: profileData.height,
      bodyComposition: profileData.bodyComposition || "average",
      primaryGoalCode: primaryGoal || savedGoals.primaryGoal || "pg5",
    });
  }, [profileData, primaryGoal, savedGoals.primaryGoal]);

  const [goalWeight, setGoalWeight] = useState(
    profileData?.goalWeight || autoGoalWeight,
  );

  useEffect(() => {
    if (primaryGoal === undefined || primaryGoal === "") return;
    if (!primaryGoalInitialized.current) {
      primaryGoalInitialized.current = true;
      return;
    }
    setGoalWeight(autoGoalWeight);
  }, [primaryGoal, autoGoalWeight]);

  useEffect(() => {
    if (fastingExperience !== "regular") {
      setSelectedFastingPlan(null);
    }
  }, [fastingExperience]);

  const timelineData = useMemo(() => {
    const currentWeight = profileData?.weight || 70;
    const delta = Math.round(Math.abs(currentWeight - goalWeight) * 10) / 10;
    const isLoss = currentWeight > goalWeight;
    const isGain = goalWeight > currentWeight;
    const maxRate = isLoss ? 1.0 : isGain ? 0.5 : 0;

    if (delta < 2 || maxRate === 0) return null;

    const direction = isLoss ? "lose" : "gain";
    const options = [{ value: "flexible", text: "No rush" }];

    for (const range of TIMELINE_RANGES) {
      const rate = delta / range.midWeeks;
      if (rate <= maxRate) {
        options.push({ value: range.value, text: range.label });
      }
    }

    if (options.length === 1) {
      const minWeeks = Math.ceil(delta / maxRate);
      const minMonths = Math.ceil(minWeeks / 4.33);
      options.push({ value: "12+m", text: `${minMonths}+ months` });
    }

    return {
      question: `You want to ${direction} ${delta} kg. Starting slow is usually the best approach — gradual changes are easier to maintain and lead to lasting results. Shorter timelines require stricter diets and heavier training, which can be hard to sustain and increase the risk of burnout or injury. Pick a pace you can realistically stick with.`,
      options,
    };
  }, [profileData?.weight, goalWeight]);

  const validate = useCallback(() => {
    if (!primaryGoal) return "Please select a primary goal";
    if (!fitnessPreferences.length)
      return "Please select at least one fitness preference";
    if (!preferredEatingSchedule) return "Please select an eating schedule";
    if (usesIntermittentFasting && !fastingExperience)
      return "Please select your fasting experience";
    return null;
  }, [
    primaryGoal,
    fitnessPreferences,
    preferredEatingSchedule,
    usesIntermittentFasting,
    fastingExperience,
  ]);

  const handleSubmit = useCallback(() => {
    const error = validate();
    if (error) {
      Toast.show({ type: 'error', text1: 'Validation', text2: error });
      return;
    }

    const healthAndFitnessGoals = {
      primaryGoal,
      fitnessPreferences,
      goalTimeline: timelineData ? goalTimeline : undefined,
      usesIntermittentFasting,
    };

    if (usesIntermittentFasting) {
      healthAndFitnessGoals.fastingExperience = fastingExperience;
      healthAndFitnessGoals.preferredEatingSchedule = preferredEatingSchedule;
    }

    const data = {
      goalWeight,
      onboarding: {
        ...(profileData?.onboarding || {}),
        onboardingStep: 4,
        healthAndFitnessGoals,
      },
    };

    if (selectedFastingPlan) {
      data.fastingSettings = {
        ...(profileData?.fastingSettings || {}),
        fastingPlanId: selectedFastingPlan,
      };
    }

    onSubmit(data);
  }, [
    validate,
    goalWeight,
    primaryGoal,
    fitnessPreferences,
    goalTimeline,
    timelineData,
    usesIntermittentFasting,
    fastingExperience,
    preferredEatingSchedule,
    selectedFastingPlan,
    profileData,
    onSubmit,
  ]);

  return (
    <View style={styles.container}>
      {/* Primary Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Goal</Text>
        <OptionPicker
          options={primaryGoalOptions}
          value={primaryGoal}
          onChange={setPrimaryGoal}
        />
      </View>

      {/* Fitness Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Preferences</Text>
        <OptionPicker
          options={fitnessPrefsOptions}
          value={fitnessPreferences}
          onChange={setFitnessPreferences}
          multiple
        />
      </View>

      {/* Goal Details */}
      <View style={styles.dividerSection}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Goal Details</Text>
          <View style={styles.dividerLine} />
        </View>

        <ValuePicker
          title="Target Weight"
          description="Set the weight you'd like to reach. The default is a healthy target based on your metrics and goal — feel free to adjust it."
          value={goalWeight}
          onChange={(v) => setGoalWeight(parseFloat(v))}
          min={30}
          max={200}
          step={0.5}
          unit="kg"
          alternativeUnit="lbs"
          convertToAlternative={(kg) => fromKgToLbs(kg).lbs}
          convertFromAlternative={fromLbsToKg}
        />

        {timelineData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <Text style={styles.sectionHint}>{timelineData.question}</Text>
            <OptionPicker
              options={timelineData.options}
              value={goalTimeline}
              onChange={setGoalTimeline}
            />
          </View>
        )}
      </View>

      {/* Preferred Eating Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Eating Schedule</Text>
        <Text style={styles.sectionHint}>
          When do you prefer to have your eating window?
        </Text>
        <OptionPicker
          options={EATING_SCHEDULE_OPTIONS}
          value={preferredEatingSchedule}
          onChange={setPreferredEatingSchedule}
        />
      </View>

      {/* Meal Timing / Intermittent Fasting */}
      <View style={styles.dividerSection}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Meal Timing</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.sectionDescription}>
          Intermittent fasting is an eating pattern that cycles between periods
          of fasting and eating. It can help with weight loss, improve metabolic
          health, and simplify your daily routine.
        </Text>

        <View style={styles.toggleRow}>
          <Text
            style={[
              styles.toggleLabel,
              usesIntermittentFasting && styles.toggleLabelActive,
            ]}
          >
            I'm interested in Intermittent Fasting
          </Text>
          <Switch
            value={usesIntermittentFasting}
            onValueChange={setUsesIntermittentFasting}
            trackColor={{ false: colors.gallery, true: colors.mainOrange }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Fasting Experience (conditional) */}
      {usesIntermittentFasting && (
        <View style={styles.fastingSection}>
          <Text style={styles.sectionTitle}>Fasting Experience</Text>
          <Text style={styles.sectionHint}>
            How experienced are you with intermittent fasting?
          </Text>
          <OptionPicker
            options={FASTING_EXPERIENCE_OPTIONS}
            value={fastingExperience}
            onChange={setFastingExperience}
          />
        </View>
      )}

      {/* Fasting Plans (conditional) */}
      {fastingExperience === "regular" && usesIntermittentFasting && (
        <View style={styles.fastingSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Preferred Fasting Plan</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.sectionHint}>
            Pick the fasting plan you'd like to follow — you can always change
            it later.
          </Text>

          {loadingPlans ? (
            <ActivityIndicator color={colors.mainBlue} style={styles.loader} />
          ) : (
            <View style={styles.fastingPlans}>
              {sortedFastingPlans.map((plan) => (
                <FastingPlanCard
                  key={plan._id}
                  {...plan}
                  selected={selectedFastingPlan === plan._id}
                  onSelect={setSelectedFastingPlan}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          style={styles.backBtn}
          disabled={loading}
        />
        <Button
          title={loading ? "Saving..." : "Continue"}
          onPress={handleSubmit}
          style={styles.nextBtn}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mainBlue,
    marginTop: spacing.md,
  },
  sectionHint: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontStyle: "italic",
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  dividerSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gallery,
  },
  dividerText: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: `${colors.mainOrange}08`,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: `${colors.mainOrange}20`,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: "600",
    color: colors.raven,
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabelActive: {
    color: colors.mainOrange,
  },
  fastingSection: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: `${colors.mainOrange}08`,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.mainOrange,
  },
  fastingPlans: {
    gap: spacing.md,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

export default GoalsStep;
