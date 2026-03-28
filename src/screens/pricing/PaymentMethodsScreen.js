import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useStripePaymentSheet } from '../../hooks';
import {
  useGetPaymentMethodsQuery,
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const CARD_BRAND_ICONS = {
  visa: 'card',
  mastercard: 'card',
  amex: 'card',
  discover: 'card',
};

const PaymentMethodsScreen = ({ navigation }) => {
  const { addPaymentMethod, isProcessing: isAdding } = useStripePaymentSheet();

  const { data: paymentMethods = [], isLoading, refetch } = useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: isSettingDefault }] = useSetDefaultPaymentMethodMutation();
  const [deleteMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation();

  const handleAddCard = useCallback(async () => {
    try {
      const result = await addPaymentMethod();
      if (result?.canceled) return;

      Toast.show({ type: 'success', text1: 'Card added successfully' });
      refetch();
    } catch (error) {
      if (error?.message?.includes('Canceled')) return;
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to add card.' });
    }
  }, [addPaymentMethod, refetch]);

  const handleSetDefault = useCallback(async (id) => {
    try {
      await setDefault(id).unwrap();
      Toast.show({ type: 'success', text1: 'Default payment method updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to update.' });
    }
  }, [setDefault]);

  const handleDelete = useCallback((id) => {
    Alert.alert('Remove Card', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMethod(id).unwrap();
            Toast.show({ type: 'success', text1: 'Card removed' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to remove.' });
          }
        },
      },
    ]);
  }, [deleteMethod]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.codGray} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.mainOrange} />
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.alto} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptyText}>Add a card to manage your subscription.</Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {paymentMethods.map((pm) => (
              <View key={pm._id || pm.stripePaymentMethodId} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Ionicons name="card" size={24} color={colors.mainBlue} />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardBrand}>
                      {pm.card?.brand?.toUpperCase() || 'Card'} •••• {pm.card?.last4 || '****'}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Expires {pm.card?.expMonth?.toString().padStart(2, '0')}/{pm.card?.expYear}
                    </Text>
                  </View>
                  {pm.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {!pm.isDefault && (
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() => handleSetDefault(pm._id || pm.stripePaymentMethodId)}
                      disabled={isSettingDefault}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cardActionText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.cardActionBtnDanger]}
                    onPress={() => handleDelete(pm._id || pm.stripePaymentMethodId)}
                    disabled={isDeleting}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardActionTextDanger}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddCard}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={colors.white} />
              <Text style={styles.addBtnText}>Add New Card</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topBarTitle: {
    ...typography.h4,
    color: colors.codGray,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.tabBarPadding,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 200,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.codGray,
  },
  emptyText: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
  },
  cardsList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cardItem: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    ...typography.label,
    color: colors.codGray,
  },
  cardExpiry: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: `${colors.mainBlue}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.mainBlue,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cardActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.mainBlue,
  },
  cardActionText: {
    ...typography.caption,
    color: colors.mainBlue,
    fontWeight: '600',
  },
  cardActionBtnDanger: {
    borderColor: colors.cinnabar,
  },
  cardActionTextDanger: {
    ...typography.caption,
    color: colors.cinnabar,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.mainOrange,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  addBtnText: {
    ...typography.button,
  },
});

export default PaymentMethodsScreen;
