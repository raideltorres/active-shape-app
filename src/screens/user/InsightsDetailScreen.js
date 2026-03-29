import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../../components/atoms/ScreenHeader';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
import { useGetProfileQuery } from '../../store/api';
import { ScoreRing, EmptyState } from '../../components/atoms';
import { InsightsSectionCard } from '../../components/molecules';

const InsightsDetailScreen = ({ navigation }) => {
  const { data: profile } = useGetProfileQuery();

  const insights = useMemo(() => {
    if (!profile?.dailyInsights) return null;
    const raw = profile.dailyInsights;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }, [profile?.dailyInsights]);

  if (!insights || !insights.overallScore) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Daily Insights" iconColor={colors.mainBlue} titleColor={colors.mainBlue} style={styles.topBar} />
        <EmptyState
          icon="analytics-outline"
          iconSize={64}
          title="No Detailed Insights"
          description="Head back to your dashboard to generate today's insights."
          style={styles.emptyState}
        />
      </View>
    );
  }

  const sections = ['nutrition', 'fitness', 'weight', 'hydration', 'supplements', 'fasting'];
  const activeSections = sections.filter((key) => insights[key]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Daily Insights" iconColor={colors.mainBlue} titleColor={colors.mainBlue} style={styles.topBar} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.overallCard}>
          <ScoreRing score={insights.overallScore} size={120} strokeWidth={10} />
          <View style={styles.overallInfo}>
            <Text style={styles.overallTitle}>Overall Score</Text>
            <Text style={styles.overallDate}>{insights.date || 'Today'}</Text>
          </View>
        </View>

        {insights.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{insights.summary}</Text>
          </View>
        )}

        {activeSections.map((key) => (
          <InsightsSectionCard key={key} sectionKey={key} section={insights[key]} />
        ))}

        {insights.priorityActions && insights.priorityActions.length > 0 && (
          <View style={styles.priorityCard}>
            <View style={styles.priorityHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${colors.mariner}15` }]}>
                <Ionicons name="rocket-outline" size={20} color={colors.mariner} />
              </View>
              <Text style={styles.sectionLabel}>Priority Actions</Text>
            </View>
            {insights.priorityActions.map((action, i) => (
              <View key={i} style={styles.actionItem}>
                <View style={styles.actionNumber}>
                  <Text style={styles.actionNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {insights.narrative && (
          <View style={styles.narrativeCard}>
            <View style={styles.narrativeHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${colors.lima}15` }]}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.lima} />
              </View>
              <Text style={styles.sectionLabel}>Coach's Analysis</Text>
            </View>
            {Array.isArray(insights.narrative) ? (
              <View style={styles.narrativeSections}>
                {insights.narrative.map((section, idx) => (
                  <View key={idx} style={styles.narrativeSection}>
                    {idx > 0 && <View style={styles.narrativeDivider} />}
                    <Text style={styles.narrativeSectionHeading}>{section.heading}</Text>
                    <Text style={styles.narrativeText}>{section.text}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.narrativeContent}>
                <Text style={styles.narrativeText}>{insights.narrative}</Text>
              </View>
            )}
          </View>
        )}

        {insights.tips && insights.tips.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsCardTitle}>Tips & Recommendations</Text>
            {insights.tips.map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={16} color={colors.buttercup} style={styles.tipItemIcon} />
                <Text style={styles.tipItemText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {insights.encouragement && (
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>{insights.encouragement}</Text>
          </View>
        )}

        <View style={{ height: spacing.tabBarPadding }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  topBar: {
    paddingTop: 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  overallCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    ...shadows.card,
  },
  overallInfo: {
    flex: 1,
  },
  overallTitle: {
    ...typography.h3,
    color: colors.mainBlue,
    marginBottom: spacing.xs,
  },
  overallDate: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    ...shadows.card,
  },
  summaryText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 24,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    ...typography.h4,
    color: colors.mineShaft,
    flex: 1,
  },
  priorityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mainOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumberText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  actionText: {
    ...typography.body,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 22,
  },
  narrativeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  narrativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  narrativeContent: {
    backgroundColor: `${colors.lima}10`,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.lima,
  },
  narrativeSections: {
    gap: 0,
  },
  narrativeSection: {
    paddingVertical: spacing.md,
  },
  narrativeDivider: {
    height: 1,
    backgroundColor: colors.gallery,
    marginBottom: spacing.md,
  },
  narrativeSectionHeading: {
    ...typography.label,
    color: colors.mainBlue,
    marginBottom: spacing.xs,
  },
  narrativeText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  tipsCardTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipItemIcon: {
    marginTop: 2,
  },
  tipItemText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
  encouragementCard: {
    backgroundColor: `${colors.lima}10`,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.lima,
  },
  encouragementText: {
    ...typography.body,
    color: colors.mineShaft,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
  },
});

export default InsightsDetailScreen;
