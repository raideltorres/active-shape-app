import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useGetProfileQuery, useUpsertUserMutation, useGetFastingPlansQuery } from '../../../store/api';
import { OnboardingFastingPlanCard as FastingPlanCard } from '../../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const FastingTab = () => {
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: fastingPlans, isLoading: plansLoading } = useGetFastingPlansQuery();
  const [upsertUser] = useUpsertUserMutation();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.fastingSettings?.fastingPlanId) {
      setSelectedPlan(profile.fastingSettings.fastingPlanId);
    }
  }, [profile?.fastingSettings?.fastingPlanId]);

  const sortedPlans = useMemo(() => {
    if (!fastingPlans) return [];
    return [...fastingPlans].sort((a, b) => a.fastingTime - b.fastingTime);
  }, [fastingPlans]);

  const handleConfirm = useCallback(async () => {
    if (!pendingPlan) return;
    try {
      setSaving(true);
      setSelectedPlan(pendingPlan._id);
      await upsertUser({
        id: profile?._id,
        fastingSettings: { ...profile?.fastingSettings, fastingPlanId: pendingPlan._id },
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Fasting Plan Updated' });
    } catch {
      setSelectedPlan(profile?.fastingSettings?.fastingPlanId ?? null);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update fasting plan.' });
    } finally {
      setSaving(false);
      setPendingPlan(null);
    }
  }, [pendingPlan, profile, upsertUser]);

  const handleSelect = useCallback((planId) => {
    if (planId === selectedPlan) return;
    const plan = sortedPlans.find((p) => p._id === planId);
    if (plan) setPendingPlan(plan);
  }, [selectedPlan, sortedPlans]);

  if (profileLoading || plansLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </View>
    );
  }

  return (
    <>
      <Text style={styles.heading}>Choose Your Fasting Plan</Text>
      <Text style={styles.description}>
        Browse and select from a variety of fasting schedules. Each plan is designed to help you achieve your health and fitness goals.
      </Text>

      <View style={styles.plansList}>
        {sortedPlans.map((plan) => (
          <FastingPlanCard
            key={plan._id}
            {...plan}
            selected={selectedPlan === plan._id}
            onSelect={handleSelect}
          />
        ))}
      </View>

      <Modal visible={!!pendingPlan} transparent animationType="fade" onRequestClose={() => setPendingPlan(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPendingPlan(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="timer-outline" size={32} color={colors.mainOrange} />
            </View>
            <Text style={styles.modalTitle}>Change Fasting Plan</Text>
            <Text style={styles.modalBody}>
              Switch to <Text style={styles.modalBold}>{pendingPlan?.title}</Text>?{'\n'}
              This will update your daily fasting schedule.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setPendingPlan(null)}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={handleConfirm}
                activeOpacity={0.7}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centered: { paddingVertical: spacing.xxl, alignItems: 'center' },
  heading: {
    ...typography.h3,
    color: colors.mainOrange,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  plansList: {
    gap: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.mainOrange}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  modalBody: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalBold: {
    fontWeight: '700',
    color: colors.mineShaft,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    ...typography.body,
    color: colors.raven,
    fontWeight: '600',
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnConfirmText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});

export default FastingTab;
