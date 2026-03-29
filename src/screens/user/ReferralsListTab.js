import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { formatCents, STATUS_COLORS } from './referralUtils';

const ReferralsListTab = ({ referralsData }) => (
  <View style={styles.tabContent}>
    {referralsData?.data?.length > 0 ? (
      referralsData.data.map((ref) => (
        <View key={ref._id} style={styles.refRow}>
          <View style={styles.refAvatar}>
            <Text style={styles.refAvatarText}>{ref.referredUserInitials}</Text>
          </View>
          <View style={styles.refInfo}>
            <Text style={styles.refPlan}>{ref.planTitle || 'No plan'}</Text>
            <Text style={styles.refDate}>{new Date(ref.referredAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.refRight}>
            <View style={[styles.refStatusBadge, { backgroundColor: `${STATUS_COLORS[ref.status] || colors.raven}20` }]}>
              <Text style={[styles.refStatusText, { color: STATUS_COLORS[ref.status] || colors.raven }]}>
                {ref.status}
              </Text>
            </View>
            {ref.monthlyCommission ? (
              <Text style={styles.refCommission}>{formatCents(ref.monthlyCommission)}</Text>
            ) : null}
          </View>
        </View>
      ))
    ) : (
      <Card>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.mercury} />
          <Text style={styles.emptyTitle}>No referrals yet</Text>
          <Text style={styles.emptyText}>
            Share your referral link to get started and earn commissions!
          </Text>
        </View>
      </Card>
    )}
  </View>
);

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },

  // Referral List
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  refAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refAvatarText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  refInfo: { flex: 1 },
  refPlan: {
    ...typography.label,
    color: colors.mineShaft,
  },
  refDate: {
    ...typography.caption,
    color: colors.raven,
  },
  refRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
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
  refCommission: {
    ...typography.label,
    color: colors.mineShaft,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
  },
});

export default ReferralsListTab;
