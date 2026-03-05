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
import {
  useGetPricingPlansQuery,
  useGetProfileQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionMutation,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const BILLING_CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const CHANGE_OPTIONS = [
  { key: 'immediate', label: 'Immediately', description: 'Switch to the new plan right now (prorated)' },
  { key: 'at_period_end', label: 'At Period End', description: 'Switch when your current billing period ends' },
];

const ChangePlanScreen = ({ navigation }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [changeOption, setChangeOption] = useState('at_period_end');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const { data: profile } = useGetProfileQuery();
  const { data: plansData, isLoading: plansLoading } = useGetPricingPlansQuery();
  const { data: currentSubscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !profile?.stripeCustomerId,
  });
  const [createSubscription] = useCreateSubscriptionMutation();

  const plans = useMemo(() => {
    if (!plansData?.data) return [];
    return [...plansData.data].sort((a, b) => a.level - b.level);
  }, [plansData]);

  const isTrialing = currentSubscription?.status === 'trialing';

  const handleSelectPlan = useCallback(async (plan) => {
    if (plan._id === profile?.planId) return;

    if (isTrialing && changeOption === 'immediate') {
      Alert.alert(
        'End Free Trial?',
        'Changing your plan immediately will end your free trial and you will be charged now.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => executePlanChange(plan._id),
          },
        ],
      );
    } else {
      await executePlanChange(plan._id);
    }
  }, [profile?.planId, billingCycle, changeOption, isTrialing]);

  const executePlanChange = useCallback(async (planId) => {
    setSelectedPlanId(planId);
    setIsProcessing(true);

    try {
      await createSubscription({
        planId,
        billingCycle,
        option: changeOption,
        platform: Platform.OS,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Plan Changed',
        text2: changeOption === 'immediate'
          ? 'Your plan has been updated.'
          : 'Your plan will change at the end of the billing period.',
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to change plan.',
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlanId(null);
    }
  }, [billingCycle, changeOption, createSubscription, navigation]);

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
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.codGray} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Change Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Billing Cycle</Text>
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

        <Text style={styles.sectionTitle}>When to Apply</Text>
        <View style={styles.optionsList}>
          {CHANGE_OPTIONS.map(({ key, label, description }) => (
            <TouchableOpacity
              key={key}
              style={[styles.optionCard, changeOption === key && styles.optionCardActive]}
              onPress={() => setChangeOption(key)}
              activeOpacity={0.8}
            >
              <View style={styles.optionRadio}>
                <View style={[styles.radioOuter, changeOption === key && styles.radioOuterActive]}>
                  {changeOption === key && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, changeOption === key && styles.optionLabelActive]}>
                  {label}
                </Text>
                <Text style={styles.optionDescription}>{description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isTrialing && changeOption === 'immediate' && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color={colors.buttercup} />
            <Text style={styles.warningText}>
              This will end your free trial and charge you immediately.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Select a Plan</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topBarTitle: {
    ...typography.h4,
    color: colors.codGray,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.tabBarPadding,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.codGray,
    marginBottom: spacing.md,
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
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
  },
  optionRadio: {
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.raven,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.mainOrange,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.mainOrange,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...typography.label,
    color: colors.codGray,
    marginBottom: 2,
  },
  optionLabelActive: {
    color: colors.mainOrange,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.raven,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.buttercup}15`,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.buttercup,
    flex: 1,
    fontWeight: '500',
  },
  plansList: {
    gap: spacing.lg,
  },
});

export default ChangePlanScreen;
