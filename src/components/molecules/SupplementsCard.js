import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import CardHeader from './CardHeader';
import { EmptyState } from '../atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
import { getCurrentDate } from '../../utils/date';

const SupplementsCard = ({
  dailySummary,
  isLoading = false,
  onToggle,
}) => {
  const todayStr = useMemo(() => getCurrentDate(), []);

  const handleToggle = useCallback(
    (supplement) => {
      if (onToggle) {
        onToggle(supplement._id, todayStr, supplement.taken);
      }
    },
    [onToggle, todayStr],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.lima} />
        </View>
      </View>
    );
  }

  if (!dailySummary || dailySummary.totalActive === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="pill"
          iconFamily="material"
          iconSize={32}
          iconColor={colors.raven}
          title="Supplements"
          description="No supplements added yet. Use the form below to add your daily supplements."
        />
      </View>
    );
  }

  const { supplements, totalActive, totalTaken } = dailySummary;
  const allTaken = totalTaken === totalActive;

  return (
    <View style={styles.container}>
      <CardHeader
        icon="pill"
        iconFamily="material"
        iconColor={colors.white}
        iconBg={colors.lima}
        title="Supplements"
        subtitle="Daily checklist"
        rightElement={(
          <View style={[styles.counterBadge, allTaken && styles.counterBadgeComplete]}>
            <Text style={[styles.counterText, allTaken && styles.counterTextComplete]}>
              {totalTaken}/{totalActive}
            </Text>
          </View>
        )}
      />

      <View style={styles.list}>
        {supplements.map((supplement) => (
          <TouchableOpacity
            key={supplement._id}
            style={[styles.item, supplement.taken && styles.itemTaken]}
            onPress={() => handleToggle(supplement)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, supplement.taken && styles.checkboxChecked]}>
              {supplement.taken && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, supplement.taken && styles.itemNameTaken]}>
                {supplement.name}
              </Text>
              {supplement.dosage && (
                <Text style={styles.itemDosage}>{supplement.dosage}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {allTaken && (
        <View style={styles.completeMessage}>
          <Ionicons name="checkmark-circle" size={16} color={colors.lima} />
          <Text style={styles.completeText}>All supplements taken today!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  counterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.gallery,
  },
  counterBadgeComplete: {
    backgroundColor: `${colors.lima}18`,
  },
  counterText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.raven,
  },
  counterTextComplete: {
    color: colors.lima,
  },
  list: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  itemTaken: {
    backgroundColor: `${colors.lima}08`,
    borderColor: `${colors.lima}20`,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.alto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.lima,
    borderColor: colors.lima,
  },
  itemInfo: {
    flex: 1,
    gap: 1,
  },
  itemName: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.mineShaft,
  },
  itemNameTaken: {
    color: colors.raven,
  },
  itemDosage: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '500',
  },
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.lima}08`,
    borderRadius: borderRadius.md,
  },
  completeText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.lima,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.alto,
  },
  setupButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.raven,
  },
});

export default React.memo(SupplementsCard);
