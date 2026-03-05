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

import { useGetInvoicesQuery } from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

const STATUS_STYLES = {
  paid: { label: 'Paid', color: colors.lima },
  open: { label: 'Open', color: colors.buttercup },
  draft: { label: 'Draft', color: colors.raven },
  void: { label: 'Void', color: colors.raven },
  uncollectible: { label: 'Failed', color: colors.cinnabar },
};

const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const InvoicesScreen = ({ navigation }) => {
  const { data: invoicesData, isLoading } = useGetInvoicesQuery({ limit: 20 });

  const invoices = useMemo(() => {
    if (!invoicesData) return [];
    return Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [];
  }, [invoicesData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.codGray} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Billing History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.mainOrange} />
          </View>
        ) : invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.alto} />
            <Text style={styles.emptyTitle}>No Invoices Yet</Text>
            <Text style={styles.emptyText}>Your billing history will appear here.</Text>
          </View>
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
                    <Text style={styles.invoiceDate}>{formatDate(invoice.created)}</Text>
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
