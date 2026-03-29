import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView as HorizontalScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { COMMISSION_TIERS } from '../../utils/measure';
import { formatCents } from './referralUtils';

const OverviewTab = ({
  stats,
  shareUrl,
  isGenerating,
  handleGenerateCode,
  handleCopyLink,
  handleShareLink,
  copied,
  activeTierIndex,
  tierProgress,
  simRows,
  handleSimRowChange,
  handleAddRow,
  handleRemoveRow,
  simResults,
  sortedPlans,
}) => (
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
          <View style={[styles.calcResultIcon, { backgroundColor: colors.purpleGradientStart }]}>
            <Ionicons name="people-outline" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.calcResultValue}>{simResults.totalCount}</Text>
            <Text style={styles.calcResultLabel}>Referrals</Text>
          </View>
        </View>
        <View style={styles.calcResultCard}>
          <View style={[styles.calcResultIcon, { backgroundColor: colors.buttercup }]}>
            <Ionicons name="ribbon-outline" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.calcResultValue}>{`${simResults.rate * 100}%`}</Text>
            <Text style={styles.calcResultLabel}>Rate</Text>
          </View>
        </View>
        <View style={styles.calcResultCard}>
          <View style={[styles.calcResultIcon, { backgroundColor: colors.mountainMeadow }]}>
            <Ionicons name="cash-outline" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.calcResultValue}>{`$${simResults.monthly.toFixed(2)}`}</Text>
            <Text style={styles.calcResultLabel}>Monthly</Text>
          </View>
        </View>
        <View style={styles.calcResultCard}>
          <View style={[styles.calcResultIcon, { backgroundColor: colors.violet }]}>
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

const styles = StyleSheet.create({
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
});

export default OverviewTab;
