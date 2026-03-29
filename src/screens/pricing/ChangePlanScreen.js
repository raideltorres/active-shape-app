import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ConfirmModal } from '../../components/atoms';
import PlanCard from '../../components/molecules/PlanCard';
import {
  useGetPricingPlansQuery,
  useGetProfileQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionMutation,
} from '../../store/api';
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { colors, spacing, typography, borderRadius } from '../../theme';

const getRemainingTrialDays = (subscription) => {
  if (subscription?.status !== 'trialing' || !subscription?.trialEnd) return 0;
  const diffMs = new Date(subscription.trialEnd) - new Date();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const pluralizeDays = (n) => `${n} ${n === 1 ? 'day' : 'days'}`;

const ChangePlanScreen = ({ navigation }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);

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
  const remainingTrialDays = useMemo(() => getRemainingTrialDays(currentSubscription), [currentSubscription]);
  const hasActiveTrial = isTrialing && remainingTrialDays > 0;

  const [changeOption, setChangeOption] = useState(() => (hasActiveTrial ? 'at_period_end' : 'immediate'));

  const changeTimingOptions = useMemo(() => [
    {
      key: 'immediate',
      label: 'Change Immediately',
      description: 'Switch to the new plan right now',
      explanation: hasActiveTrial
        ? `This will end your free trial (${pluralizeDays(remainingTrialDays)} remaining) and charge you immediately`
        : 'You will be charged a prorated amount for the new plan today',
    },
    {
      key: 'at_period_end',
      label: 'At Period End',
      description: hasActiveTrial
        ? 'Change when your free trial ends'
        : 'Change at the end of billing cycle',
      explanation: hasActiveTrial
        ? `Keep your free trial and switch plans in ${pluralizeDays(remainingTrialDays)}`
        : 'Continue with your current plan until the billing period ends',
    },
  ], [hasActiveTrial, remainingTrialDays]);

  const confirmPrice = useMemo(() => {
    if (!confirmPlan) return '';
    const raw = billingCycle === 'yearly' ? confirmPlan.yearlyPrice : confirmPlan.monthlyPrice;
    return raw ? (raw / 100).toFixed(2) : '0.00';
  }, [confirmPlan, billingCycle]);

  const handleSelectPlan = useCallback((plan) => {
    if (plan._id === profile?.planId) return;
    setConfirmPlan(plan);
  }, [profile?.planId]);

  const handleConfirmChange = useCallback(async () => {
    if (!confirmPlan) return;
    setIsProcessing(true);

    try {
      await createSubscription({
        planId: confirmPlan._id,
        billingCycle,
        option: changeOption,
        platform: Platform.OS,
      }).unwrap();

      setConfirmPlan(null);
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
    }
  }, [confirmPlan, billingCycle, changeOption, createSubscription, navigation]);

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
      <ScreenHeader title="Change Plan" titleColor={colors.codGray} iconColor={colors.codGray} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Billing Cycle</Text>
        <View style={styles.toggleRow}>
          {['monthly', 'yearly'].map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.toggleBtn, billingCycle === key && styles.toggleBtnActive]}
              onPress={() => setBillingCycle(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, billingCycle === key && styles.toggleTextActive]}>
                {key === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>When to Apply</Text>
        <View style={styles.optionsList}>
          {changeTimingOptions.map(({ key, label, description, explanation }) => (
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
                <Text style={styles.optionExplanation}>{explanation}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Select a Plan</Text>
        <View style={styles.plansList}>
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={plan._id === profile?.planId}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={!!confirmPlan}
        title={hasActiveTrial && changeOption === 'immediate' ? 'End Free Trial?' : 'Confirm Plan Change'}
        icon={hasActiveTrial && changeOption === 'immediate' ? 'warning' : 'swap-horizontal'}
        iconColor={hasActiveTrial && changeOption === 'immediate' ? colors.buttercup : colors.mainOrange}
        confirmText="Confirm Change"
        cancelText="Cancel"
        onConfirm={handleConfirmChange}
        onCancel={() => setConfirmPlan(null)}
        isLoading={isProcessing}
      >
        <View style={styles.modalBody}>
          <View style={styles.modalSummaryCard}>
            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>Plan</Text>
              <Text style={styles.modalSummaryValue}>{confirmPlan?.title}</Text>
            </View>
            <View style={styles.modalDivider} />
            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>Price</Text>
              <Text style={styles.modalSummaryValue}>
                ${confirmPrice}/{billingCycle === 'yearly' ? 'year' : 'month'}
              </Text>
            </View>
            <View style={styles.modalDivider} />
            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>Billing</Text>
              <Text style={styles.modalSummaryValue}>
                {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
            </View>
            <View style={styles.modalDivider} />
            <View style={styles.modalSummaryRow}>
              <Text style={styles.modalSummaryLabel}>Applies</Text>
              <Text style={styles.modalSummaryValue}>
                {changeOption === 'immediate' ? 'Immediately' : 'At period end'}
              </Text>
            </View>
          </View>

          {changeOption === 'immediate' && hasActiveTrial && (
            <View style={styles.modalWarning}>
              <Ionicons name="warning" size={16} color={colors.buttercup} />
              <Text style={styles.modalWarningText}>
                You have <Text style={styles.warningBold}>{pluralizeDays(remainingTrialDays)}</Text> of
                free trial remaining. Changing now will end your trial and charge you immediately.
              </Text>
            </View>
          )}

          {changeOption === 'immediate' && !hasActiveTrial && (
            <View style={[styles.modalWarning, { backgroundColor: `${colors.mainBlue}10` }]}>
              <Ionicons name="information-circle" size={16} color={colors.mainBlue} />
              <Text style={[styles.modalWarningText, { color: colors.mainBlue }]}>
                You will be charged a <Text style={styles.warningBold}>prorated amount</Text> based on
                your remaining billing period.
              </Text>
            </View>
          )}

          {changeOption === 'at_period_end' && (
            <View style={[styles.modalWarning, { backgroundColor: `${colors.lima}12` }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.lima} />
              <Text style={[styles.modalWarningText, { color: colors.lima }]}>
                Your current plan will remain active until the end of the billing period.
              </Text>
            </View>
          )}
        </View>
      </ConfirmModal>
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
  optionExplanation: {
    ...typography.caption,
    color: colors.raven,
    fontStyle: 'italic',
    marginTop: 4,
  },
  plansList: {
    gap: spacing.lg,
  },
  modalBody: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modalSummaryCard: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  modalSummaryLabel: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  modalSummaryValue: {
    ...typography.bodySmall,
    color: colors.codGray,
    fontWeight: '600',
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.gallery,
  },
  modalWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.buttercup}12`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalWarningText: {
    ...typography.caption,
    color: colors.buttercup,
    flex: 1,
    lineHeight: 18,
  },
  warningBold: {
    fontWeight: '700',
  },
});

export default ChangePlanScreen;
