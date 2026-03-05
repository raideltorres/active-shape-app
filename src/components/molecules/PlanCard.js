import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const PlanCard = ({ plan, billingCycle, isCurrentPlan, isProcessing, onSelect }) => {
  const price = useMemo(() => {
    if (billingCycle === 'yearly') {
      return plan.yearlyPrice ? (plan.yearlyPrice / 100).toFixed(2) : '0.00';
    }
    return plan.monthlyPrice ? (plan.monthlyPrice / 100).toFixed(2) : '0.00';
  }, [plan, billingCycle]);

  const period = billingCycle === 'yearly' ? '/year' : '/month';

  const savingsPercent = plan.yearlyDiscountPercent || 0;

  return (
    <View style={[styles.card, plan.isPromoted && styles.cardPromoted, isCurrentPlan && styles.cardCurrent]}>
      {plan.isPromoted && (
        <View style={styles.promotedBadge}>
          <Ionicons name="star" size={12} color={colors.white} />
          <Text style={styles.promotedText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currency}>{plan.currency} </Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.period}>{period}</Text>
        </View>
        {billingCycle === 'yearly' && savingsPercent > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
          </View>
        )}
      </View>

      {plan.description ? (
        <Text style={styles.description}>{plan.description}</Text>
      ) : null}

      <View style={styles.featuresList}>
        {plan.features?.map((feature, index) => (
          feature ? (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.lima} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ) : null
        ))}
      </View>

      {isCurrentPlan ? (
        <View style={styles.currentBadge}>
          <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
          <Text style={styles.currentBadgeText}>Current Plan</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.selectBtn, plan.isPromoted && styles.selectBtnPromoted]}
          onPress={onSelect}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.selectBtnText}>Choose this plan</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardPromoted: {
    borderColor: colors.mainOrange,
  },
  cardCurrent: {
    borderColor: colors.mainBlue,
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mainOrange,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  promotedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  planTitle: {
    ...typography.h3,
    color: colors.mainBlue,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    ...typography.body,
    color: colors.raven,
    fontWeight: '600',
  },
  price: {
    ...typography.h1,
    color: colors.codGray,
  },
  period: {
    ...typography.body,
    color: colors.raven,
    marginLeft: 2,
  },
  savingsBadge: {
    backgroundColor: `${colors.lima}20`,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  savingsText: {
    ...typography.caption,
    color: colors.lima,
    fontWeight: '700',
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
  },
  selectBtn: {
    backgroundColor: colors.mainBlue,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBtnPromoted: {
    backgroundColor: colors.mainOrange,
  },
  selectBtnText: {
    ...typography.button,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.mainBlue,
    height: 48,
    borderRadius: borderRadius.lg,
    opacity: 0.8,
  },
  currentBadgeText: {
    ...typography.button,
  },
});

export default memo(PlanCard);
