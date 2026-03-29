import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { formatCents, STATUS_COLORS } from './referralUtils';

const PayoutsTab = ({
  connectStatus,
  stats,
  payoutsData,
  taxSummary,
  payoutAmount,
  setPayoutAmount,
  handleSetupConnect,
  isSettingUpConnect,
  handleRequestPayout,
  isRequestingPayout,
}) => (
  <View style={styles.tabContent}>
    {connectStatus?.onboardingComplete ? (
      <>
        {/* Payout Stats */}
        <View style={styles.payoutStatsRow}>
          <View style={styles.payoutStatCard}>
            <View style={[styles.payoutStatIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.payoutStatLabel}>Status</Text>
            <Text style={styles.payoutStatValue}>Connected</Text>
          </View>
          <View style={styles.payoutStatCard}>
            <View style={[styles.payoutStatIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="time-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.payoutStatLabel}>Pending</Text>
            <Text style={styles.payoutStatValue}>{formatCents(stats?.pendingPayout ?? 0)}</Text>
          </View>
          <View style={styles.payoutStatCard}>
            <View style={[styles.payoutStatIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="cash-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.payoutStatLabel}>Earned</Text>
            <Text style={styles.payoutStatValue}>{formatCents(stats?.totalEarnings ?? 0)}</Text>
          </View>
        </View>

        {/* Payout Destination */}
        {connectStatus?.payoutDestination && (
          <Card style={styles.payoutDestCard}>
            <View style={styles.payoutDestRow}>
              <View style={styles.payoutDestIcon}>
                <Ionicons name="wallet-outline" size={18} color={colors.mainBlue} />
              </View>
              <View style={styles.payoutDestInfo}>
                <Text style={styles.payoutDestLabel}>Payout destination</Text>
                <Text style={styles.payoutDestValue}>
                  {connectStatus.payoutDestination.type === 'bank_account'
                    ? `${connectStatus.payoutDestination.bankName || 'Bank'} ····${connectStatus.payoutDestination.last4}`
                    : `${connectStatus.payoutDestination.brand} ····${connectStatus.payoutDestination.last4}`}
                  {connectStatus.payoutDestination.country && ` · ${connectStatus.payoutDestination.country}`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Payout Request */}
        {(stats?.pendingPayout ?? 0) >= 5000 ? (
          <Card>
            <Text style={styles.payoutRequestTitle}>Request Payout</Text>
            <Text style={styles.payoutRequestSubtitle}>
              Available: {formatCents(stats?.pendingPayout ?? 0)} · Minimum: $50
            </Text>
            <View style={styles.payoutInputRow}>
              <Text style={styles.payoutInputPrefix}>$</Text>
              <TextInput
                style={styles.payoutInput}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                keyboardType="numeric"
                placeholder="50"
                placeholderTextColor={colors.raven}
              />
            </View>
            <TouchableOpacity
              style={styles.payoutBtn}
              onPress={handleRequestPayout}
              disabled={isRequestingPayout}
              activeOpacity={0.7}
            >
              {isRequestingPayout ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.payoutBtnText}>Confirm Payout</Text>
              )}
            </TouchableOpacity>
          </Card>
        ) : (
          <Card>
            <Text style={styles.payoutThreshold}>
              You can request a payout once your pending balance reaches $50.
            </Text>
          </Card>
        )}
      </>
    ) : (
      <Card>
        <View style={styles.connectContent}>
          <View style={styles.connectIconWrap}>
            <Ionicons name="wallet-outline" size={24} color={colors.mainBlue} />
          </View>
          <Text style={styles.connectTitle}>Set up payouts to start earning</Text>
          <Text style={styles.connectDesc}>
            Connect your bank account via Stripe to receive commission payouts. Setup takes about 2 minutes.
          </Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={handleSetupConnect}
            disabled={isSettingUpConnect}
            activeOpacity={0.7}
          >
            {isSettingUpConnect ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.connectBtnText}>Connect with Stripe</Text>
            )}
          </TouchableOpacity>
        </View>
      </Card>
    )}

    {/* Payout History */}
    {payoutsData?.data?.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payout History</Text>
        {payoutsData.data.map((payout) => (
          <View key={payout._id} style={styles.payoutRow}>
            <View style={styles.payoutRowLeft}>
              <Text style={styles.payoutAmountText}>{formatCents(payout.amount)}</Text>
              <Text style={styles.payoutPeriod}>
                {new Date(payout.periodStart).toLocaleDateString()} — {new Date(payout.periodEnd).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.payoutRowRight}>
              <View style={[styles.refStatusBadge, { backgroundColor: `${STATUS_COLORS[payout.status] || colors.raven}20` }]}>
                <Text style={[styles.refStatusText, { color: STATUS_COLORS[payout.status] || colors.raven }]}>
                  {payout.status}
                </Text>
              </View>
              <Text style={styles.payoutDate}>{new Date(payout.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}
      </View>
    )}

    {/* Tax Summary */}
    {taxSummary?.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Annual Tax Summary</Text>
        <Text style={styles.taxNote}>
          Completed payouts aggregated by year. Tax forms (1099) are generated automatically by Stripe.
        </Text>
        {taxSummary.map((row) => (
          <View key={row.year} style={styles.taxRow}>
            <Text style={styles.taxYear}>{row.year}</Text>
            <Text style={styles.taxAmount}>{formatCents(row.totalAmount)}</Text>
            <Text style={styles.taxPayouts}>{row.payoutCount} payout{row.payoutCount !== 1 ? 's' : ''}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },

  // Payout Stats
  payoutStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  payoutStatCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  payoutStatIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutStatLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  payoutStatValue: {
    ...typography.label,
    color: colors.mineShaft,
    fontSize: 13,
  },

  // Payout Destination
  payoutDestCard: { marginTop: 0 },
  payoutDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  payoutDestIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.mainBlue}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutDestInfo: { flex: 1 },
  payoutDestLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  payoutDestValue: {
    ...typography.label,
    color: colors.mineShaft,
  },

  // Payout Request
  payoutRequestTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: 4,
  },
  payoutRequestSubtitle: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: spacing.md,
  },
  payoutInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mercury,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  payoutInputPrefix: {
    ...typography.h4,
    color: colors.raven,
    marginRight: spacing.xs,
  },
  payoutInput: {
    flex: 1,
    ...typography.h4,
    color: colors.mineShaft,
    paddingVertical: spacing.md,
  },
  payoutBtn: {
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutBtnText: {
    ...typography.button,
    color: colors.white,
  },
  payoutThreshold: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // Connect (not set up)
  connectContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  connectIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.mainBlue}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    textAlign: 'center',
  },
  connectDesc: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
  },
  connectBtn: {
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  connectBtnText: {
    ...typography.button,
    color: colors.white,
  },

  // Sections
  section: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
  },

  // Payout History Rows
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  payoutRowLeft: { flex: 1 },
  payoutAmountText: {
    ...typography.label,
    color: colors.mineShaft,
  },
  payoutPeriod: {
    ...typography.caption,
    color: colors.raven,
  },
  payoutRowRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  payoutDate: {
    ...typography.caption,
    color: colors.raven,
  },

  // Shared status badge (also used in referrals list)
  refStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  refStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Tax Summary
  taxNote: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: spacing.sm,
  },
  taxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taxYear: {
    ...typography.label,
    color: colors.mineShaft,
    width: 50,
  },
  taxAmount: {
    ...typography.label,
    color: colors.mineShaft,
    flex: 1,
  },
  taxPayouts: {
    ...typography.caption,
    color: colors.raven,
  },
});

export default PayoutsTab;
