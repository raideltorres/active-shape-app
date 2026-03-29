import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ConfirmModal, EmptyState } from '../../components/atoms';
import {
  useGetCurrentSubscriptionQuery,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetProfileQuery,
} from '../../store/api';
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { formatDisplayDate } from '../../utils/date';
import { colors, spacing, typography, borderRadius } from '../../theme';

const STATUS_CONFIG = {
  active: { label: 'Active', color: colors.lima, icon: 'checkmark-circle' },
  trialing: { label: 'Free Trial', color: colors.mainOrange, icon: 'time' },
  past_due: { label: 'Past Due', color: colors.cinnabar, icon: 'alert-circle' },
  canceled: { label: 'Canceled', color: colors.raven, icon: 'close-circle' },
  paused: { label: 'Paused', color: colors.buttercup, icon: 'pause-circle' },
  incomplete: { label: 'Incomplete', color: colors.buttercup, icon: 'alert-circle' },
  incomplete_expired: { label: 'Expired', color: colors.raven, icon: 'close-circle' },
  unpaid: { label: 'Unpaid', color: colors.cinnabar, icon: 'alert-circle' },
};

const SubscriptionScreen = ({ navigation }) => {
  const { data: profile } = useGetProfileQuery();
  const {
    data: subscription,
    isLoading,
    refetch,
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !profile?.stripeCustomerId,
  });

  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [resumeSubscription, { isLoading: isResuming }] = useResumeSubscriptionMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const statusInfo = useMemo(() => {
    return STATUS_CONFIG[subscription?.status] || STATUS_CONFIG.active;
  }, [subscription?.status]);

  const planTitle = useMemo(() => {
    return subscription?.planId?.title || 'Unknown Plan';
  }, [subscription]);

  const periodEndFormatted = useMemo(() => {
    return subscription?.currentPeriodEnd ? formatDisplayDate(subscription.currentPeriodEnd) : '';
  }, [subscription]);

  const handleConfirmCancel = useCallback(async () => {
    try {
      await cancelSubscription({
        subscriptionId: subscription._id,
        cancelAt: 'period_end',
      }).unwrap();
      setShowCancelModal(false);
      Toast.show({ type: 'success', text1: 'Subscription canceled', text2: 'Active until end of billing period.' });
      refetch();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to cancel.' });
    }
  }, [subscription, cancelSubscription, refetch]);

  const handleResume = useCallback(async () => {
    try {
      await resumeSubscription(subscription._id).unwrap();
      Toast.show({ type: 'success', text1: 'Subscription resumed', text2: 'Welcome back!' });
      refetch();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to resume.' });
    }
  }, [subscription, resumeSubscription, refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
        </View>
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Subscription" titleColor={colors.codGray} iconColor={colors.codGray} />
        <EmptyState
          icon="card-outline"
          iconSize={64}
          iconColor={colors.alto}
          title="No Active Subscription"
          description="Visit the pricing page to subscribe to a plan."
          style={styles.emptyContainer}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Subscription" titleColor={colors.codGray} iconColor={colors.codGray} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{planTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {subscription.cancelAtPeriodEnd && (
          <View style={styles.warningCard}>
            <Ionicons name="information-circle" size={20} color={colors.buttercup} />
            <Text style={styles.warningText}>
              Your subscription will end on {formatDisplayDate(subscription.currentPeriodEnd)}.
            </Text>
          </View>
        )}

        <View style={styles.detailsCard}>
          <DetailRow label="Billing Cycle" value={subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} />
          <DetailRow label="Amount" value={`${subscription.currency?.toUpperCase()} $${subscription.amount?.toFixed(2) || '0.00'}`} />
          {subscription.cancelAtPeriodEnd ? (
            <DetailRow label="Cancels On" value={formatDisplayDate(subscription.currentPeriodEnd)} />
          ) : (
            subscription.currentPeriodEnd &&
            !['canceled', 'incomplete_expired'].includes(subscription.status) && (
              <DetailRow label="Renews On" value={formatDisplayDate(subscription.currentPeriodEnd)} />
            )
          )}
          {subscription.status === 'trialing' && subscription.trialEnd && (
            <DetailRow label="Trial Ends" value={formatDisplayDate(subscription.trialEnd)} />
          )}
          {subscription.canceledAt && (
            <DetailRow label="Canceled On" value={formatDisplayDate(subscription.canceledAt)} />
          )}
          {subscription.platform && (
            <DetailRow label="Platform" value={subscription.platform.charAt(0).toUpperCase() + subscription.platform.slice(1)} />
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('PaymentMethods')}
            activeOpacity={0.7}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="card-outline" size={20} color={colors.mainBlue} />
              <Text style={styles.actionBtnText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.raven} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Invoices')}
            activeOpacity={0.7}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="receipt-outline" size={20} color={colors.mainBlue} />
              <Text style={styles.actionBtnText}>Billing History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.raven} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ChangePlan')}
            activeOpacity={0.7}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="swap-horizontal-outline" size={20} color={colors.mainBlue} />
              <Text style={styles.actionBtnText}>Change Plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.raven} />
          </TouchableOpacity>
        </View>

        {subscription.cancelAtPeriodEnd ? (
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={handleResume}
            disabled={isResuming}
            activeOpacity={0.8}
          >
            {isResuming ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.resumeBtnText}>Resume Subscription</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowCancelModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showCancelModal}
        title="Cancel Subscription"
        icon="close-circle"
        iconColor={colors.cinnabar}
        confirmText="Cancel Subscription"
        cancelText="Keep Plan"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        isLoading={isCanceling}
        destructive
      >
        <View style={styles.cancelModalBody}>
          <View style={styles.cancelSummaryCard}>
            <View style={styles.cancelSummaryRow}>
              <Text style={styles.cancelSummaryLabel}>Plan</Text>
              <Text style={styles.cancelSummaryValue}>{planTitle}</Text>
            </View>
            <View style={styles.cancelDivider} />
            <View style={styles.cancelSummaryRow}>
              <Text style={styles.cancelSummaryLabel}>Status</Text>
              <View style={styles.cancelStatusBadge}>
                <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                <Text style={[styles.cancelStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
            </View>
            {periodEndFormatted ? (
              <>
                <View style={styles.cancelDivider} />
                <View style={styles.cancelSummaryRow}>
                  <Text style={styles.cancelSummaryLabel}>Active Until</Text>
                  <Text style={styles.cancelSummaryValue}>{periodEndFormatted}</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.cancelInfoCard}>
            <Ionicons name="information-circle" size={16} color={colors.mainBlue} />
            <Text style={styles.cancelInfoText}>
              Your subscription will remain active until the end of your current billing period.
              You will not be charged again.
            </Text>
          </View>
        </View>
      </ConfirmModal>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
  emptyContainer: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  planName: {
    ...typography.h2,
    color: colors.mainBlue,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
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
  detailsCard: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.codGray,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  actionsSection: {
    gap: 1,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionBtnText: {
    ...typography.body,
    color: colors.codGray,
  },
  resumeBtn: {
    backgroundColor: colors.mainOrange,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeBtnText: {
    ...typography.button,
  },
  cancelBtn: {
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cinnabar,
  },
  cancelBtnText: {
    ...typography.button,
    color: colors.cinnabar,
  },
  cancelModalBody: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cancelSummaryCard: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cancelSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  cancelSummaryLabel: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  cancelSummaryValue: {
    ...typography.bodySmall,
    color: colors.codGray,
    fontWeight: '600',
  },
  cancelDivider: {
    height: 1,
    backgroundColor: colors.gallery,
  },
  cancelStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cancelInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.mainBlue}10`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  cancelInfoText: {
    ...typography.caption,
    color: colors.mainBlue,
    flex: 1,
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
