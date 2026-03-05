import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { useGetProfileQuery } from '../../store/api';

const SECTION_CONFIG = {
  nutrition: { label: 'Nutrition', icon: 'food-apple-outline', color: colors.mainOrange },
  fitness: { label: 'Fitness', icon: 'dumbbell', color: colors.mariner },
  weight: { label: 'Weight', icon: 'scale-bathroom', color: colors.cinnabar },
  hydration: { label: 'Hydration', icon: 'water-outline', color: colors.lightBlue, isIonicon: true },
  supplements: { label: 'Supplements', icon: 'pill', color: colors.lima },
  fasting: { label: 'Fasting', icon: 'flash-outline', color: colors.buttercup, isIonicon: true },
};

const getScoreColor = (score) => {
  if (score >= 90) return colors.lima;
  if (score >= 75) return colors.mariner;
  if (score >= 60) return colors.buttercup;
  if (score >= 40) return colors.mainOrange;
  return colors.cinnabar;
};

const ScoreRing = ({ score, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <View style={[styles.scoreRing, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.gallery}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.scoreValue}>
        <Text style={styles.scoreNumber}>{score}</Text>
      </View>
    </View>
  );
};

const SectionCard = ({ sectionKey, section }) => {
  const config = SECTION_CONFIG[sectionKey];
  if (!section || !config) return null;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${config.color}15` }]}>
          {config.isIonicon ? (
            <Ionicons name={config.icon} size={20} color={config.color} />
          ) : (
            <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
          )}
        </View>
        <Text style={styles.sectionLabel}>{config.label}</Text>
        <ScoreRing score={section.score} size={48} strokeWidth={4} />
      </View>
      <Text style={styles.sectionAnalysis}>{section.analysis}</Text>
      {section.highlights && section.highlights.length > 0 && (
        <View style={styles.highlightsContainer}>
          {section.highlights.map((h, i) => (
            <View key={i} style={styles.highlightItem}>
              <Ionicons name="flame" size={14} color={colors.mainOrange} style={styles.highlightIcon} />
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

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
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.mainBlue} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Daily Insights</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color={colors.mercury} />
          <Text style={styles.emptyTitle}>No Detailed Insights</Text>
          <Text style={styles.emptyDescription}>
            Head back to your dashboard to generate today's insights.
          </Text>
        </View>
      </View>
    );
  }

  const sections = ['nutrition', 'fitness', 'weight', 'hydration', 'supplements', 'fasting'];
  const activeSections = sections.filter((key) => insights[key]);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.mainBlue} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Daily Insights</Text>
        <View style={styles.backBtn} />
      </View>

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
          <SectionCard key={key} sectionKey={key} section={insights[key]} />
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
            <View style={styles.narrativeContent}>
              <Text style={styles.narrativeText}>{insights.narrative}</Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...typography.h4,
    color: colors.mainBlue,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  scoreRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.mainBlue,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 24,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
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
  sectionAnalysis: {
    ...typography.body,
    color: colors.raven,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  highlightsContainer: {
    gap: spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  highlightIcon: {
    marginTop: 2,
  },
  highlightText: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
  priorityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  narrativeText: {
    ...typography.body,
    color: colors.mineShaft,
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default InsightsDetailScreen;
