import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useGetProfileQuery,
  useGeneratePersonalizedPlanMutation,
} from '../../store/api';
import { colors, spacing, typography } from '../../theme';

const SUCCESS_DISPLAY_MS = 5000;

const GENERATION_STEPS = [
  { id: 1, text: 'Analyzing your profile...' },
  { id: 2, text: 'Calculating optimal nutrition goals...' },
  { id: 3, text: 'Designing your activity plan...' },
  { id: 4, text: 'Creating hydration strategy...' },
  { id: 5, text: 'Personalizing recommendations...' },
  { id: 6, text: 'Finalizing your transformation plan...' },
];

const STEP_INTERVAL_MS = 2500;
const REDIRECT_DELAY_MS = 1500;

const StepItem = ({ step, index, currentStep }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isCompleted = currentStep > index;
  const isActive = currentStep === index;
  const isPending = currentStep < index;

  useEffect(() => {
    if (isActive || isCompleted) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, isCompleted, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.stepItem,
        { opacity: isPending ? 0.35 : fadeAnim },
      ]}
    >
      <View
        style={[
          styles.stepIcon,
          isCompleted && styles.stepIconCompleted,
          isActive && styles.stepIconActive,
        ]}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={14} color={colors.white} />
        ) : isActive ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <View style={styles.stepIconPlaceholder} />
        )}
      </View>
      <Text
        style={[
          styles.stepText,
          isCompleted && styles.stepTextCompleted,
          isActive && styles.stepTextActive,
        ]}
      >
        {step.text}
      </Text>
    </Animated.View>
  );
};

const PlanGenerationScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const hasStarted = useRef(false);
  const successFadeAnim = useRef(new Animated.Value(0)).current;

  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [generatePlan, { isLoading, isError, error, isSuccess, reset }] =
    useGeneratePersonalizedPlanMutation();

  const startGeneration = useCallback(async () => {
    try {
      await generatePlan().unwrap();
      setCurrentStep(GENERATION_STEPS.length);
    } catch {
      // Error state handled by isError
    }
  }, [generatePlan]);

  const handleRetry = useCallback(() => {
    reset();
    setCurrentStep(0);
    hasStarted.current = true;
    startGeneration();
  }, [startGeneration, reset]);

  useEffect(() => {
    if (isLoadingProfile) return;
    if (!profileData?.onboarding?.finished) return;
    if (profileData?.personalizedPlan) return;
    if (hasStarted.current) return;

    hasStarted.current = true;
    startGeneration();
  }, [isLoadingProfile, profileData, startGeneration]);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isSuccess) return;

    Animated.timing(successFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

  }, [isSuccess, successFadeAnim]);

  return (
    <LinearGradient
      colors={[colors.purpleGradientStart, colors.purpleGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.card}>
            {!isError && !isSuccess && (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Creating Your Personalized Plan</Text>
                  <Text style={styles.description}>
                    We're analyzing your profile to create a comprehensive health
                    transformation plan tailored just for you. This will only take a
                    moment...
                  </Text>
                </View>

                <View style={styles.stepsContainer}>
                  {GENERATION_STEPS.map((step, index) => (
                    <StepItem
                      key={step.id}
                      step={step}
                      index={index}
                      currentStep={currentStep}
                    />
                  ))}
                </View>
              </>
            )}

            {isSuccess && (
              <Animated.View
                style={[styles.resultContainer, { opacity: successFadeAnim }]}
              >
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={40} color={colors.white} />
                </View>
                <Text style={styles.resultTitle}>Plan Generated Successfully!</Text>
                <Text style={styles.resultMessage}>
                  Redirecting to your personalized plan...
                </Text>
                <ActivityIndicator
                  size="small"
                  color={colors.mainBlue}
                  style={styles.redirectSpinner}
                />
              </Animated.View>
            )}

            {isError && (
              <View style={styles.resultContainer}>
                <View style={styles.errorIcon}>
                  <Ionicons name="warning" size={40} color={colors.white} />
                </View>
                <Text style={styles.resultTitle}>Unable to Generate Plan</Text>
                <Text style={styles.resultMessage}>
                  {error?.data?.message ||
                    'We encountered an issue while creating your personalized plan. This could be due to incomplete profile information or a temporary server issue.'}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.purpleGradientStart, colors.purpleGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.retryGradient}
                  >
                    <Ionicons name="refresh" size={18} color={colors.white} />
                    <Text style={styles.retryText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 28,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.h2,
    color: colors.codGray,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.alto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: {
    backgroundColor: colors.limeGreen,
  },
  stepIconActive: {
    backgroundColor: colors.mainBlue,
  },
  stepIconPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.mercury,
    backgroundColor: 'transparent',
  },
  stepText: {
    ...typography.body,
    color: colors.raven,
    flex: 1,
  },
  stepTextCompleted: {
    color: colors.codGray,
  },
  stepTextActive: {
    color: colors.mainBlue,
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.limeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.limeGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  resultTitle: {
    ...typography.h2,
    color: colors.codGray,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultMessage: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  redirectSpinner: {
    marginTop: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.xxl,
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default PlanGenerationScreen;
