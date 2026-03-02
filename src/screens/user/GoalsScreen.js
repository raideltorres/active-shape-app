import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import ValuePicker from '../../components/molecules/ValuePicker/ValuePicker';
import {
  useGetProfileQuery,
  useUpsertUserMutation,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { fromKgToLbs, fromLbsToKg } from '../../utils/measure';

const GoalDisplayCard = ({ icon, title, current, target, progress, color }) => (
  <View style={styles.goalCard}>
    <View style={styles.goalHeader}>
      <View style={[styles.goalIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.goalInfo}>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={styles.goalTarget}>Target: {target}</Text>
      </View>
      <Text style={[styles.goalCurrent, { color }]}>{current}</Text>
    </View>
    <View style={styles.goalProgress}>
      <View style={styles.goalProgressBar}>
        <View
          style={[
            styles.goalProgressFill,
            { width: `${Math.min(progress, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.goalProgressText}>{Math.round(progress)}%</Text>
    </View>
  </View>
);

const GoalsScreen = ({ navigation }) => {
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [upsertUser, { isLoading: isSaving }] = useUpsertUserMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [goalWeight, setGoalWeight] = useState(70);
  const [calories, setCalories] = useState(2000);
  const [proteins, setProteins] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fats, setFats] = useState(65);

  useEffect(() => {
    if (!profile) return;

    setGoalWeight(profile.goalWeight || profile.personalizedPlan?.weightPlan?.goalWeight || 70);
    setCalories(profile.nutritionGoals?.calories || profile.personalizedPlan?.nutritionPlan?.daily?.calories || 2000);
    setProteins(profile.nutritionGoals?.proteins || profile.personalizedPlan?.nutritionPlan?.daily?.protein || 150);
    setCarbs(profile.nutritionGoals?.carbs || profile.personalizedPlan?.nutritionPlan?.daily?.carbs || 200);
    setFats(profile.nutritionGoals?.fats || profile.personalizedPlan?.nutritionPlan?.daily?.fats || 65);
  }, [profile]);

  const handleSave = useCallback(async () => {
    try {
      await upsertUser({
        id: profile._id,
        goalWeight,
        nutritionGoals: { calories, proteins, carbs, fats },
      }).unwrap();

      Toast.show({ type: 'success', text1: 'Goals Updated', text2: 'Your fitness goals have been saved.' });
      setIsEditing(false);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.data?.message || 'Please try again.',
      });
    }
  }, [profile, goalWeight, calories, proteins, carbs, fats, upsertUser]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setGoalWeight(profile.goalWeight || profile.personalizedPlan?.weightPlan?.goalWeight || 70);
      setCalories(profile.nutritionGoals?.calories || 2000);
      setProteins(profile.nutritionGoals?.proteins || 150);
      setCarbs(profile.nutritionGoals?.carbs || 200);
      setFats(profile.nutritionGoals?.fats || 65);
    }
    setIsEditing(false);
  }, [profile]);

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      </SafeAreaView>
    );
  }

  const currentWeight = profile?.weight || 0;
  const weightProgress = goalWeight && currentWeight
    ? Math.max(0, Math.min(100, ((currentWeight - goalWeight) / (currentWeight - goalWeight || 1)) * 100))
    : 0;

  const plan = profile?.personalizedPlan;
  const hydrationGoal = plan?.hydrationPlan?.dailyWaterGoal || 2.5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
          </TouchableOpacity>
          <Text style={styles.title}>My Goals</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={colors.mainOrange} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Ionicons name="close" size={24} color={colors.raven} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButton]}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="checkmark" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!isEditing ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Goals</Text>
              <GoalDisplayCard
                icon="scale-outline"
                title="Weight Goal"
                current={`${currentWeight} kg`}
                target={`${goalWeight} kg`}
                progress={currentWeight <= goalWeight ? 100 : ((currentWeight - goalWeight) > 0 ? 50 : 0)}
                color={colors.purple}
              />
              <GoalDisplayCard
                icon="flame-outline"
                title="Daily Calories"
                current={`${calories.toLocaleString()}`}
                target={`${calories.toLocaleString()} kcal`}
                progress={100}
                color={colors.mainOrange}
              />
              <GoalDisplayCard
                icon="barbell-outline"
                title="Protein"
                current={`${proteins}g`}
                target={`${proteins}g daily`}
                progress={100}
                color={colors.lima}
              />
              <GoalDisplayCard
                icon="water-outline"
                title="Daily Water"
                current={`${hydrationGoal}L`}
                target={`${hydrationGoal}L`}
                progress={100}
                color={colors.havelockBlue}
              />
            </View>

            <View style={styles.macroSummary}>
              <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
              <View style={styles.macroRow}>
                <View style={[styles.macroCard, { borderTopColor: colors.mainOrange }]}>
                  <Ionicons name="flame" size={20} color={colors.mainOrange} />
                  <Text style={styles.macroValue}>{calories.toLocaleString()}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={[styles.macroCard, { borderTopColor: colors.lima }]}>
                  <Ionicons name="fish" size={20} color={colors.lima} />
                  <Text style={styles.macroValue}>{proteins}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={[styles.macroCard, { borderTopColor: colors.havelockBlue }]}>
                  <Ionicons name="leaf" size={20} color={colors.havelockBlue} />
                  <Text style={styles.macroValue}>{carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={[styles.macroCard, { borderTopColor: colors.purple }]}>
                  <Ionicons name="egg" size={20} color={colors.purple} />
                  <Text style={styles.macroValue}>{fats}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight Goal</Text>
              <View style={styles.card}>
                <ValuePicker
                  title="Target Weight"
                  description="Set your target weight to track your progress over time."
                  value={goalWeight}
                  onChange={(v) => setGoalWeight(parseFloat(v))}
                  min={30}
                  max={300}
                  step={0.1}
                  unit="kg"
                  alternativeUnit="lbs"
                  convertToAlternative={(kg) => fromKgToLbs(kg).lbs}
                  convertFromAlternative={fromLbsToKg}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Nutrition Goals</Text>
              <View style={styles.card}>
                <ValuePicker
                  title="Calories"
                  value={calories}
                  onChange={(v) => setCalories(parseInt(v, 10))}
                  min={1000}
                  max={10000}
                  step={50}
                  unit="kcal"
                />
                <View style={styles.pickerDivider} />
                <ValuePicker
                  title="Proteins"
                  value={proteins}
                  onChange={(v) => setProteins(parseInt(v, 10))}
                  min={50}
                  max={500}
                  step={5}
                  unit="g"
                />
                <View style={styles.pickerDivider} />
                <ValuePicker
                  title="Carbohydrates"
                  value={carbs}
                  onChange={(v) => setCarbs(parseInt(v, 10))}
                  min={50}
                  max={500}
                  step={5}
                  unit="g"
                />
                <View style={styles.pickerDivider} />
                <ValuePicker
                  title="Fats"
                  value={fats}
                  onChange={(v) => setFats(parseInt(v, 10))}
                  min={30}
                  max={200}
                  step={5}
                  unit="g"
                />
              </View>
            </View>
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.mainBlue,
  },
  title: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.raven,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: colors.gallery,
    marginVertical: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  goalTarget: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  goalCurrent: {
    ...typography.h3,
    fontWeight: '700',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gallery,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressText: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  macroSummary: {
    marginBottom: spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderTopWidth: 3,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  macroValue: {
    ...typography.h3,
    color: colors.mineShaft,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});

export default GoalsScreen;
