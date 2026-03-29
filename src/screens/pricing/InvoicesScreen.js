import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../components/atoms';
import { useGetInvoicesQuery } from '../../store/api';
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { formatDisplayDate } from '../../utils/date';
import { colors, spacing, typography, borderRadius } from '../../theme';

const STATUS_STYLES = {
  paid: { label: 'Paid', color: colors.lima },
  open: { label: 'Open', color: colors.buttercup },
  draft: { label: 'Draft', color: colors.raven },
  void: { label: 'Void', color: colors.raven },
  uncollectible: { label: 'Failed', color: colors.cinnabar },
};

const InvoicesScreen = ({ navigation }) => {
  const { data: invoicesData, isLoading } = useGetInvoicesQuery({ limit: 20 });

  const invoices = useMemo(() => {
    if (!invoicesData) return [];
    return Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [];
  }, [invoicesData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Billing History" titleColor={colors.codGray} iconColor={colors.codGray} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.mainOrange} />
          </View>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            iconSize={64}
            iconColor={colors.alto}
            title="No Invoices Yet"
            description="Your billing history will appear here."
            style={styles.emptyContainer}
          />
        ) : (
          <View style={styles.invoicesList}>
            {invoices.map((invoice) => {
              const status = STATUS_STYLES[invoice.status] || STATUS_STYLES.draft;
              const amount = invoice.amount_paid != null
                ? (invoice.amount_paid / 100).toFixed(2)
                : invoice.total != null
                  ? (invoice.total / 100).toFixed(2)
                  : '0.00';

              return (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.invoiceItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (invoice.hosted_invoice_url) {
                      Linking.openURL(invoice.hosted_invoice_url);
                    }
                  }}
                >
                  <View style={styles.invoiceLeft}>
                    <Text style={styles.invoiceNumber}>
                      {invoice.number || `INV-${invoice.id?.slice(-8)}`}
                    </Text>
                    <Text style={styles.invoiceDate}>{formatDisplayDate(invoice.created, { month: 'short' })}</Text>
                  </View>

                  <View style={styles.invoiceRight}>
                    <Text style={styles.invoiceAmount}>
                      ${amount} {invoice.currency?.toUpperCase()}
                    </Text>
                    <View style={[styles.invoiceStatusBadge, { backgroundColor: `${status.color}20` }]}>
                      <Text style={[styles.invoiceStatusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    minHeight: 200,
  },
  invoicesList: {
    gap: 1,
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  invoiceLeft: {
    flex: 1,
  },
  invoiceNumber: {
    ...typography.label,
    color: colors.codGray,
  },
  invoiceDate: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  invoiceAmount: {
    ...typography.label,
    color: colors.codGray,
  },
  invoiceStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  invoiceStatusText: {
    ...typography.caption,
    fontWeight: '700',
  },
});

export default InvoicesScreen;
