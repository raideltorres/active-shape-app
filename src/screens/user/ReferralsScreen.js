import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { TabScreenLayout } from '../../components/templates';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  useGetReferralStatsQuery,
  useGetReferralsListQuery,
  useGetPayoutHistoryQuery,
  useGetConnectStatusQuery,
  useGetTaxSummaryQuery,
  useGenerateReferralCodeMutation,
  useSetupStripeConnectMutation,
  useRequestPayoutMutation,
  useGetPricingPlansQuery,
} from '../../store/api';

import OverviewTab from './OverviewTab';
import ReferralsListTab from './ReferralsListTab';
import PayoutsTab from './PayoutsTab';
import { formatCents, STATUS_COLORS } from './referralUtils';

const WEB_BASE_URL = 'https://www.active-shape.com';

const getActiveTierIndex = (activeReferrals) => {
  if (activeReferrals >= 25) return 2;
  if (activeReferrals >= 10) return 1;
  if (activeReferrals >= 1) return 0;
  return -1;
};

const getNextTierProgress = (activeReferrals) => {
  if (activeReferrals >= 25) return { needed: 0, nextLabel: null };
  if (activeReferrals >= 10) return { needed: 25 - activeReferrals, nextLabel: '20%' };
  if (activeReferrals >= 1) return { needed: 10 - activeReferrals, nextLabel: '15%' };
  return { needed: 1, nextLabel: '10%' };
};


const STAT_ITEMS = [
  { key: 'totalReferrals', label: 'Total Referrals', icon: 'people-outline', color: '#667eea' },
  { key: 'activeReferrals', label: 'Active', icon: 'trending-up-outline', color: '#10b981' },
  { key: 'commissionRate', label: 'Commission', icon: 'ribbon-outline', color: '#f59e0b', isRate: true },
  { key: 'totalEarnings', label: 'Earned', icon: 'cash-outline', color: '#8b5cf6', isCurrency: true },
];

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'share-social-outline' },
  { key: 'referrals', label: 'Referrals', icon: 'people-outline' },
  { key: 'payouts', label: 'Payouts', icon: 'wallet-outline' },
];

const ReferralsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('50');

  const { data: stats, isLoading: isLoadingStats } = useGetReferralStatsQuery();
  const { data: referralsData } = useGetReferralsListQuery({ page: 1, limit: 50 });
  const { data: payoutsData } = useGetPayoutHistoryQuery({ page: 1, limit: 20 });
  const { data: connectStatus } = useGetConnectStatusQuery();
  const { data: taxSummary } = useGetTaxSummaryQuery();
  const { data: pricingPlansData } = useGetPricingPlansQuery();

  const [generateCode, { isLoading: isGenerating }] = useGenerateReferralCodeMutation();
  const [setupConnect, { isLoading: isSettingUpConnect }] = useSetupStripeConnectMutation();
  const [requestPayout, { isLoading: isRequestingPayout }] = useRequestPayoutMutation();

  const shareUrl = useMemo(() => {
    if (!stats?.code) return null;
    const slug = stats.customSlug || stats.code;
    return `${WEB_BASE_URL}?ref=${slug}`;
  }, [stats?.code, stats?.customSlug]);

  const handleGenerateCode = useCallback(async () => {
    await generateCode();
  }, [generateCode]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleShareLink = useCallback(async () => {
    if (!shareUrl) return;
    await Share.share({
      message: `Join Active Shape and get AI-powered nutrition & fitness coaching! ${shareUrl}`,
      url: shareUrl,
    });
  }, [shareUrl]);

  const handleSetupConnect = useCallback(async () => {
    try {
      const result = await setupConnect().unwrap();
      if (result?.url) {
        Linking.openURL(result.url);
      }
    } catch {
      Alert.alert('Error', 'Failed to set up Stripe Connect. Please try again.');
    }
  }, [setupConnect]);

  const handleRequestPayout = useCallback(async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 50) {
      Alert.alert('Invalid Amount', 'Minimum payout amount is $50.');
      return;
    }
    const maxAmount = (stats?.pendingPayout ?? 0) / 100;
    if (amount > maxAmount) {
      Alert.alert('Invalid Amount', `Maximum amount is $${maxAmount.toFixed(2)}.`);
      return;
    }
    try {
      await requestPayout(Math.round(amount * 100)).unwrap();
      Alert.alert('Success', 'Your payout request has been submitted.');
    } catch {
      Alert.alert('Error', 'Failed to request payout. Please try again.');
    }
  }, [requestPayout, payoutAmount, stats?.pendingPayout]);

  const activeTierIndex = getActiveTierIndex(stats?.activeReferrals || 0);
  const tierProgress = getNextTierProgress(stats?.activeReferrals || 0);

  const sortedPlans = useMemo(() => {
    if (!pricingPlansData?.data) return [];
    return [...pricingPlansData.data].sort((a, _b) => a.level - _b.level);
  }, [pricingPlansData]);

  const [simRows, setSimRows] = useState([{ id: 1, planId: null, billing: 'monthly', count: 10 }]);

  const handleSimRowChange = useCallback((id, field, value) => {
    setSimRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const handleAddRow = useCallback(() => {
    setSimRows((prev) => [
      ...prev,
      { id: Date.now(), planId: sortedPlans[0]?._id || null, billing: 'monthly', count: 5 },
    ]);
  }, [sortedPlans]);

  const handleRemoveRow = useCallback((id) => {
    setSimRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const simResults = useMemo(() => {
    const planMap = new Map(sortedPlans.map((p) => [p._id, p]));
    const totalCount = simRows.reduce((sum, r) => sum + (r.count || 0), 0);
    let rate = 0;
    if (totalCount >= 25) rate = 0.2;
    else if (totalCount >= 10) rate = 0.15;
    else if (totalCount >= 1) rate = 0.1;

    let monthly = 0;
    for (const row of simRows) {
      const plan = planMap.get(row.planId) || sortedPlans[0];
      if (!plan) continue;
      const monthlyRevenue = row.billing === 'yearly'
        ? (plan.yearlyPrice || 0) / 12 / 100
        : (plan.monthlyPrice || 0) / 100;
      monthly += (row.count || 0) * monthlyRevenue * rate;
    }

    return { rate, totalCount, monthly, yearly: monthly * 12 };
  }, [simRows, sortedPlans]);

  const getStatValue = (item) => {
    const raw = stats?.[item.key];
    if (item.isRate) return raw ? `${raw * 100}%` : '10%';
    if (item.isCurrency) return formatCents(raw ?? 0);
    return raw ?? 0;
  };

  if (isLoadingStats) {
    return (
      <TabScreenLayout title="Referral Program" showProfileButton={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
        </View>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout
      title="Referral Program"
      subtitle="Earn recurring commissions by inviting others to Active Shape."
      showProfileButton={false}
    >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STAT_ITEMS.map((item) => (
            <View key={item.key} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={18} color={colors.white} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{getStatValue(item)}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={tab.icon} size={16} color={isActive ? colors.mainOrange : colors.raven} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            shareUrl={shareUrl}
            isGenerating={isGenerating}
            handleGenerateCode={handleGenerateCode}
            handleCopyLink={handleCopyLink}
            handleShareLink={handleShareLink}
            copied={copied}
            activeTierIndex={activeTierIndex}
            tierProgress={tierProgress}
            simRows={simRows}
            handleSimRowChange={handleSimRowChange}
            handleAddRow={handleAddRow}
            handleRemoveRow={handleRemoveRow}
            simResults={simResults}
            sortedPlans={sortedPlans}
          />
        )}
        {activeTab === 'referrals' && (
          <ReferralsListTab referralsData={referralsData} />
        )}
        {activeTab === 'payouts' && (
          <PayoutsTab
            connectStatus={connectStatus}
            stats={stats}
            payoutsData={payoutsData}
            taxSummary={taxSummary}
            payoutAmount={payoutAmount}
            setPayoutAmount={setPayoutAmount}
            handleSetupConnect={handleSetupConnect}
            isSettingUpConnect={isSettingUpConnect}
            handleRequestPayout={handleRequestPayout}
            isRequestingPayout={isRequestingPayout}
          />
        )}
    </TabScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    width: '48.5%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: { flex: 1 },
  statValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: `${colors.mainOrange}10`,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
});

export default ReferralsScreen;
