import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PersonalInfoStep from './PersonalInfoStep';
import MetricsStep from './MetricsStep';
import GoalsStep from './GoalsStep';
import DietaryStep from './DietaryStep';
import LifestyleStep from './LifestyleStep';
import HealthInfoStep from './HealthInfoStep';

import AnimatedProgressBar from '../../components/atoms/AnimatedProgressBar';
import {
  useGetProfileQuery,
  useUpsertUserMutation,
  useGetAllConstantsQuery,
} from '../../store/api';
import { colors, spacing, typography } from '../../theme';

const STEP_CONFIG = {
  1: { title: 'Personal Information', Component: PersonalInfoStep },
  2: { title: 'Metrics', Component: MetricsStep },
  3: { title: 'Health & Fitness Goals', Component: GoalsStep },
  4: { title: 'Dietary Preferences & Allergies', Component: DietaryStep },
  5: { title: 'Lifestyle & Habits', Component: LifestyleStep },
  6: { title: 'Health Information', Component: HealthInfoStep },
};

const OnboardingScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const { data: profileData, isFetching } = useGetProfileQuery();
  const { data: allConstants } = useGetAllConstantsQuery();
  const [upsertUser, { isLoading: isSaving }] = useUpsertUserMutation();

  const currentStep = profileData?.onboarding?.onboardingStep || 1;
  const { title, Component } = STEP_CONFIG[Math.min(currentStep, 6)] || STEP_CONFIG[6];

  useEffect(() => {
    if (
      profileData?.onboarding?.onboardingStep === 7 &&
      profileData?.onboarding?.finished
    ) {
      navigation.replace('SubscriptionPlaceholder');
    }
  }, [profileData, navigation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const handleSubmit = useCallback(
    async (values) => {
      try {
        await upsertUser({ id: profileData._id, ...values }).unwrap();
      } catch (err) {
        const msg =
          err?.data?.message || 'Failed to save. Please try again.';
        Alert.alert('Error', msg);
      }
    },
    [upsertUser, profileData],
  );

  const handleBack = useCallback(async () => {
    if (currentStep <= 1) return;
    try {
      await upsertUser({
        id: profileData._id,
        onboarding: {
          ...profileData.onboarding,
          onboardingStep: currentStep - 1,
        },
      }).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to go back. Please try again.');
    }
  }, [upsertUser, profileData, currentStep]);

  if (isFetching && !profileData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mainBlue} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.heading}>Onboarding</Text>
            <Text style={styles.subtitle}>
              We'll collect a few details to personalize your experience — diet
              plans, workouts, and wellness goals tailored just for you.
            </Text>
          </View>

          <AnimatedProgressBar currentStep={currentStep} totalSteps={6} />

          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{title}</Text>
          </View>

          <Component
            onSubmit={handleSubmit}
            onBack={handleBack}
            profileData={profileData}
            optionsData={allConstants}
            loading={isSaving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h1,
    color: colors.mainBlue,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  stepHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.codGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    ...typography.body,
    color: colors.raven,
    marginTop: spacing.md,
  },
});

export default OnboardingScreen;
