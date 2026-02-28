import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  useGetFastingHistoryQuery,
  useDeleteFastingSessionMutation,
} from '../../store/api';
import { FASTING_STAGES, getCurrentStage } from '../../constants/fasting';
import { secondsToShortTime } from '../../utils/fasting';
import { colors, spacing, typography, borderRadius } from '../../theme';

const PAGE_SIZE = 20;

const SessionCard = ({ session, onDelete }) => {
  const durationSeconds = session.actualDurationSeconds || 0;
  const stage = getCurrentStage(durationSeconds);
  const plannedHours = session.plannedDurationHours || 0;
  const goalAchieved = session.goalAchieved;

  const startDate = new Date(session.startTime);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this fasting session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(session._id) },
      ],
    );
  };

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionDate}>
          <Text style={styles.sessionDateText}>{dateStr}</Text>
          <Text style={styles.sessionTimeText}>{timeStr}</Text>
        </View>
        <View style={styles.sessionActions}>
          {goalAchieved && (
            <View style={styles.goalBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.lima} />
              <Text style={styles.goalBadgeText}>Goal</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.raven} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sessionBody}>
        <View style={[styles.stageIndicator, { backgroundColor: `${stage.color}20` }]}>
          <Ionicons name={stage.icon} size={20} color={stage.color} />
        </View>
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionDuration}>{secondsToShortTime(durationSeconds)}</Text>
          <Text style={styles.sessionPlan}>
            {session.fastingPlanTitle || `${plannedHours}h plan`}
          </Text>
        </View>
        <View style={styles.sessionStage}>
          <Text style={[styles.sessionStageText, { color: stage.color }]}>{stage.label}</Text>
        </View>
      </View>

      {session.stagesReached?.length > 0 && (
        <View style={styles.stagesRow}>
          {FASTING_STAGES.filter((s) =>
            session.stagesReached.includes(s.label),
          ).map((s) => (
            <View key={s.label} style={[styles.stageChip, { backgroundColor: `${s.color}15` }]}>
              <View style={[styles.stageChipDot, { backgroundColor: s.color }]} />
              <Text style={[styles.stageChipText, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const FastingHistoryScreen = ({ navigation }) => {
  const [page, setPage] = useState(0);

  const { data: historyData, isLoading, isFetching, refetch } = useGetFastingHistoryQuery({
    limit: PAGE_SIZE,
    skip: page * PAGE_SIZE,
  });

  const [deleteSession] = useDeleteFastingSessionMutation();

  const sessions = useMemo(() => {
    if (!historyData) return [];
    return Array.isArray(historyData) ? historyData : historyData.sessions || [];
  }, [historyData]);

  const handleDelete = useCallback(
    async (sessionId) => {
      try {
        await deleteSession(sessionId).unwrap();
      } catch {
        Alert.alert('Error', 'Failed to delete session. Please try again.');
      }
    },
    [deleteSession],
  );

  const renderItem = useCallback(
    ({ item }) => <SessionCard session={item} onDelete={handleDelete} />,
    [handleDelete],
  );

  const keyExtractor = useCallback((item) => item._id, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fasting History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, styles.tabActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={16} color={colors.mainOrange} />
          <Text style={[styles.tabText, styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate('FastingCalendar')}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.raven} />
          <Text style={styles.tabText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate('FastingStats')}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={colors.raven} />
          <Text style={styles.tabText}>Stats</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="timer-outline" size={48} color={colors.alto} />
            <Text style={styles.emptyTitle}>No Fasting Sessions</Text>
            <Text style={styles.emptyText}>
              Start your first fast from the dashboard to see your history here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.alabaster,
  },
  tabActive: {
    backgroundColor: `${colors.mainOrange}15`,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.raven,
  },
  tabTextActive: {
    color: colors.mainOrange,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionDate: {},
  sessionDateText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  sessionTimeText: {
    ...typography.caption,
    color: colors.raven,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.lima}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.lima,
  },
  sessionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stageIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDuration: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  sessionPlan: {
    ...typography.caption,
    color: colors.raven,
  },
  sessionStage: {
    alignItems: 'flex-end',
  },
  sessionStageText: {
    ...typography.caption,
    fontWeight: '600',
  },
  stagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  stageChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default FastingHistoryScreen;
