import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  Share,
  ScrollView as HorizontalScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { Card } from '../../components/molecules';
import { TabScreenLayout } from '../../components/templates';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { COMMISSION_TIERS } from '../../utils/measure';
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

const WEB_BASE_URL = 'https://www.active-shape.com';

const formatCents = (cents) => `$${(cents / 100).toFixed(2)}`;

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

const STATUS_COLORS = {
  active: colors.lima,
  qualified: colors.havelockBlue,
  pending: colors.buttercup,
  paused: colors.raven,
  expired: colors.error,
  completed: colors.lima,
  processing: colors.havelockBlue,
  failed: colors.error,
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

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Share Link */}
      <Card>
        <View style={styles.shareHeader}>
          <View style={styles.shareIconWrap}>
            <Ionicons name="share-social" size={20} color={colors.white} />
          </View>
          <View style={styles.shareHeaderText}>
            <Text style={styles.shareTitle}>Share Your Link</Text>
            <Text style={styles.shareSubtitle}>
              Share this link with friends. When they sign up and subscribe, you earn commissions.
            </Text>
          </View>
        </View>

        {!stats?.hasCode ? (
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateCode}
            disabled={isGenerating}
            activeOpacity={0.7}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.generateBtnText}>Generate Referral Code</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.shareLinkSection}>
            <View style={styles.shareLinkRow}>
              <Ionicons name="link-outline" size={18} color={colors.raven} />
              <Text style={styles.shareLinkText} numberOfLines={1}>{shareUrl}</Text>
            </View>
            <View style={styles.shareActions}>
              <TouchableOpacity
                style={[styles.shareBtn, copied && styles.shareBtnCopied]}
                onPress={handleCopyLink}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copied ? colors.lima : colors.white}
                />
                <Text style={[styles.shareBtnText, copied && styles.shareBtnTextCopied]}>
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShareLink}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={16} color={colors.white} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Commission Tiers */}
        <View style={styles.tiersDivider} />
        <View style={styles.tiersHeader}>
          <Text style={styles.tiersTitle}>Commission Tiers</Text>
          {tierProgress.nextLabel && (
            <Text style={styles.tiersHint}>
              {tierProgress.needed} more to reach {tierProgress.nextLabel}
            </Text>
          )}
        </View>
        <View style={styles.tiersRow}>
          {COMMISSION_TIERS.map((tier, i) => {
            const isActive = i === activeTierIndex;
            const isCompleted = i < activeTierIndex;
            return (
              <View
                key={tier.label}
                style={[
                  styles.tierCard,
                  isActive && styles.tierCardActive,
                  isCompleted && styles.tierCardCompleted,
                ]}
              >
                {isActive && <Text style={styles.tierBadgeCurrent}>CURRENT</Text>}
                {isCompleted && (
                  <View style={styles.tierBadgeDone}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.lima} />
                  </View>
                )}
                <View style={[
                  styles.tierIconRing,
                  isActive && styles.tierIconRingActive,
                  isCompleted && styles.tierIconRingCompleted,
                ]}>
                  <Ionicons
                    name="ribbon"
                    size={20}
                    color={isActive || isCompleted ? colors.white : colors.raven}
                  />
                </View>
                <Text style={[
                  styles.tierRateValue,
                  isActive && styles.tierRateActive,
                  isCompleted && styles.tierRateCompleted,
                ]}>
                  {`${tier.rate * 100}%`}
                </Text>
                <Text style={styles.tierLabel}>{tier.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Earnings Calculator */}
      <Card>
        <View style={styles.calcHeader}>
          <Ionicons name="calculator-outline" size={18} color={colors.mainOrange} />
          <View style={styles.calcHeaderText}>
            <Text style={styles.calcTitle}>Earnings Calculator</Text>
            <Text style={styles.calcSubtitle}>
              Estimates based on current pricing. Plan prices may change, but your commission tier rates are locked in and guaranteed.
            </Text>
          </View>
        </View>

        {simRows.map((row) => {
          const selectedPlan = sortedPlans.find((p) => p._id === row.planId) || sortedPlans[0];
          return (
            <View key={row.id} style={styles.calcRow}>
              <HorizontalScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calcPlanPicker}>
                {sortedPlans.map((plan) => {
                  const isSelected = (row.planId || sortedPlans[0]?._id) === plan._id;
                  return (
                    <TouchableOpacity
                      key={plan._id}
                      style={[styles.calcPlanChip, isSelected && styles.calcPlanChipActive]}
                      onPress={() => handleSimRowChange(row.id, 'planId', plan._id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.calcPlanChipText, isSelected && styles.calcPlanChipTextActive]}>
                        {plan.title}
                      </Text>
                      <Text style={[styles.calcPlanChipPrice, isSelected && styles.calcPlanChipPriceActive]}>
                        ${((plan.monthlyPrice || 0) / 100).toFixed(0)}/mo
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HorizontalScrollView>

              <View style={styles.calcRowControls}>
                <View style={styles.calcBillingToggle}>
                  <TouchableOpacity
                    style={[styles.calcBillingBtn, row.billing === 'monthly' && styles.calcBillingBtnActive]}
                    onPress={() => handleSimRowChange(row.id, 'billing', 'monthly')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calcBillingText, row.billing === 'monthly' && styles.calcBillingTextActive]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.calcBillingBtn, row.billing === 'yearly' && styles.calcBillingBtnActive]}
                    onPress={() => handleSimRowChange(row.id, 'billing', 'yearly')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calcBillingText, row.billing === 'yearly' && styles.calcBillingTextActive]}>
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calcCountGroup}>
                  <TouchableOpacity
                    style={styles.calcCountBtn}
                    onPress={() => handleSimRowChange(row.id, 'count', Math.max(1, (row.count || 1) - 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={16} color={colors.mineShaft} />
                  </TouchableOpacity>
                  <Text style={styles.calcCountValue}>{row.count || 0}</Text>
                  <TouchableOpacity
                    style={styles.calcCountBtn}
                    onPress={() => handleSimRowChange(row.id, 'count', Math.min(500, (row.count || 0) + 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color={colors.mineShaft} />
                  </TouchableOpacity>
                </View>

                {simRows.length > 1 && (
                  <TouchableOpacity
                    style={styles.calcRemoveBtn}
                    onPress={() => handleRemoveRow(row.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.calcAddBtn} onPress={handleAddRow} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={18} color={colors.mainOrange} />
          <Text style={styles.calcAddBtnText}>Add plan</Text>
        </TouchableOpacity>

        <View style={styles.calcDivider} />

        <View style={styles.calcResultsGrid}>
          <View style={styles.calcResultCard}>
            <View style={[styles.calcResultIcon, { backgroundColor: '#667eea' }]}>
              <Ionicons name="people-outline" size={16} color={colors.white} />
            </View>
            <View>
              <Text style={styles.calcResultValue}>{simResults.totalCount}</Text>
              <Text style={styles.calcResultLabel}>Referrals</Text>
            </View>
          </View>
          <View style={styles.calcResultCard}>
            <View style={[styles.calcResultIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="ribbon-outline" size={16} color={colors.white} />
            </View>
            <View>
              <Text style={styles.calcResultValue}>{`${simResults.rate * 100}%`}</Text>
              <Text style={styles.calcResultLabel}>Rate</Text>
            </View>
          </View>
          <View style={styles.calcResultCard}>
            <View style={[styles.calcResultIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="cash-outline" size={16} color={colors.white} />
            </View>
            <View>
              <Text style={styles.calcResultValue}>{`$${simResults.monthly.toFixed(2)}`}</Text>
              <Text style={styles.calcResultLabel}>Monthly</Text>
            </View>
          </View>
          <View style={styles.calcResultCard}>
            <View style={[styles.calcResultIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="trending-up-outline" size={16} color={colors.white} />
            </View>
            <View>
              <Text style={styles.calcResultValue}>{`$${simResults.yearly.toFixed(2)}`}</Text>
              <Text style={styles.calcResultLabel}>Yearly</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderReferrals = () => (
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

  const renderPayouts = () => (
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
                <Text style={styles.payoutAmount}>{formatCents(payout.amount)}</Text>
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

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'referrals' && renderReferrals()}
        {activeTab === 'payouts' && renderPayouts()}
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
  tabContent: {
    gap: spacing.lg,
  },

  // Share Card
  shareHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  shareIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareHeaderText: { flex: 1 },
  shareTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: 2,
  },
  shareSubtitle: {
    ...typography.caption,
    color: colors.raven,
  },
  generateBtn: {
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    ...typography.button,
    color: colors.white,
  },
  shareLinkSection: { gap: spacing.sm },
  shareLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.mercury,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  shareLinkText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
  },
  shareActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.mainOrange,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
  },
  shareBtnCopied: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lima,
  },
  shareBtnText: {
    ...typography.label,
    color: colors.white,
  },
  shareBtnTextCopied: {
    color: colors.lima,
  },

  // Tiers
  tiersDivider: {
    height: 1,
    backgroundColor: colors.mercury,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  tiersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tiersTitle: {
    ...typography.label,
    color: colors.mineShaft,
  },
  tiersHint: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '600',
  },
  tiersRow: {
    gap: spacing.sm,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  tierCardActive: {
    backgroundColor: `${colors.mainOrange}12`,
    borderWidth: 2,
    borderColor: colors.mainOrange,
  },
  tierCardCompleted: {
    backgroundColor: `${colors.lima}10`,
    borderWidth: 2,
    borderColor: colors.lima,
  },
  tierBadgeCurrent: {
    position: 'absolute',
    top: 8,
    right: 12,
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierBadgeDone: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  tierIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mercury,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierIconRingActive: { backgroundColor: colors.mainOrange },
  tierIconRingCompleted: { backgroundColor: colors.lima },
  tierRateValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.raven,
  },
  tierRateActive: { color: colors.mainOrange },
  tierRateCompleted: { color: colors.lima },
  tierLabel: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
  },

  // Earnings Calculator
  calcHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  calcHeaderText: {
    flex: 1,
  },
  calcTitle: {
    ...typography.label,
    color: colors.mineShaft,
    marginBottom: 4,
  },
  calcSubtitle: {
    ...typography.caption,
    color: colors.raven,
    lineHeight: 18,
  },
  calcRow: {
    marginBottom: spacing.md,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  calcPlanPicker: {
    marginBottom: spacing.sm,
  },
  calcPlanChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.mercury,
    alignItems: 'center',
  },
  calcPlanChipActive: {
    backgroundColor: `${colors.mainOrange}12`,
    borderColor: colors.mainOrange,
  },
  calcPlanChipText: {
    ...typography.caption,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  calcPlanChipTextActive: {
    color: colors.mainOrange,
  },
  calcPlanChipPrice: {
    ...typography.caption,
    color: colors.raven,
    fontSize: 10,
    marginTop: 1,
  },
  calcPlanChipPriceActive: {
    color: colors.mainOrange,
  },
  calcRowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  calcBillingToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mercury,
    overflow: 'hidden',
  },
  calcBillingBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  calcBillingBtnActive: {
    backgroundColor: colors.mainOrange,
  },
  calcBillingText: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '600',
  },
  calcBillingTextActive: {
    color: colors.white,
  },
  calcCountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mercury,
    overflow: 'hidden',
  },
  calcCountBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  calcCountValue: {
    ...typography.label,
    color: colors.mineShaft,
    minWidth: 32,
    textAlign: 'center',
  },
  calcRemoveBtn: {
    padding: spacing.sm,
    marginLeft: 'auto',
  },
  calcAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  calcAddBtnText: {
    ...typography.label,
    color: colors.mainOrange,
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.mercury,
    marginBottom: spacing.md,
  },
  calcResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  calcResultCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  calcResultIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcResultValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  calcResultLabel: {
    ...typography.caption,
    color: colors.raven,
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
  payoutAmount: {
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

export default ReferralsScreen;
