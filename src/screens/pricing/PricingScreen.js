import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import PlanCard from '../../components/molecules/PlanCard';
import { useAuth, useStripePaymentSheet } from '../../hooks';
import {
  useGetPricingPlansQuery,
  useGetProfileQuery,
  useGetCurrentSubscriptionQuery,
  useLazyGetPaymentMethodsQuery,
  useCreateSubscriptionMutation,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const BILLING_CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const PricingScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const { addPaymentMethod } = useStripePaymentSheet();

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: profile } = useGetProfileQuery();
  const { data: plansData, isLoading: plansLoading } = useGetPricingPlansQuery();
  const { data: currentSubscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !profile?.stripeCustomerId,
  });

  const [getPaymentMethods] = useLazyGetPaymentMethodsQuery();
  const [createSubscription] = useCreateSubscriptionMutation();

  const plans = useMemo(() => {
    if (!plansData?.data) return [];
    return [...plansData.data].sort((a, b) => a.level - b.level);
  }, [plansData]);

  const handleSelectPlan = useCallback(async (plan) => {
    if (plan._id === profile?.planId) return;

    setSelectedPlanId(plan._id);
    setIsProcessing(true);

    try {
      const paymentMethodsResult = await getPaymentMethods().unwrap();

      if (paymentMethodsResult?.length > 0) {
        await createSubscriptionForPlan(plan._id);
      } else {
        await addPaymentMethodAndSubscribe(plan._id);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to process subscription.',
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlanId(null);
    }
  }, [profile?.planId, billingCycle, getPaymentMethods]);

  const createSubscriptionForPlan = useCallback(async (planId) => {
    const payload = {
      planId,
      billingCycle,
      platform: Platform.OS,
    };

    await createSubscription(payload).unwrap();

    Toast.show({
      type: 'success',
      text1: 'Welcome!',
      text2: 'Your subscription has been created successfully.',
    });
  }, [billingCycle, createSubscription]);

  const addPaymentMethodAndSubscribe = useCallback(async (planId) => {
    const result = await addPaymentMethod();
    if (result?.canceled) return;

    await createSubscriptionForPlan(planId);
  }, [addPaymentMethod, createSubscriptionForPlan]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: signOut, style: 'destructive' },
    ]);
  }, [signOut]);

  if (plansLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="diamond" size={48} color={colors.mainOrange} />
          </View>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock your personalized health plan, AI-powered insights, and premium features.
          </Text>
        </View>

        <View style={styles.toggleRow}>
          {BILLING_CYCLES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.toggleBtn, billingCycle === key && styles.toggleBtnActive]}
              onPress={() => setBillingCycle(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, billingCycle === key && styles.toggleTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.plansList}>
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={plan._id === profile?.planId}
              isProcessing={isProcessing && selectedPlanId === plan._id}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.raven} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.mainOrange}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.mainBlue,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xxl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  toggleBtnActive: {
    backgroundColor: colors.mainOrange,
  },
  toggleText: {
    ...typography.label,
    color: colors.raven,
  },
  toggleTextActive: {
    color: colors.white,
  },
  plansList: {
    gap: spacing.lg,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.xxl,
  },
  signOutText: {
    ...typography.body,
    color: colors.raven,
  },
});

export default PricingScreen;
