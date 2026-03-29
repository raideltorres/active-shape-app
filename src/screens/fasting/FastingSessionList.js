import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FASTING_STAGES, getCurrentStage } from "../../constants/fasting";
import { secondsToShortTime } from "../../utils/fasting";
import { colors, spacing, typography, borderRadius } from "../../theme";

const FastingSessionList = ({
  selectedDate,
  selectedDayData,
  sessions,
  onDeleteSession,
}) => {
  if (!selectedDate) return null;

  return (
    <View style={styles.dayDetailWrap}>
      <Text style={styles.dayDetailDate}>
        {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </Text>

      {selectedDayData ? (
        <View style={styles.dayDetailSummary}>
          <View style={styles.dayDetailRow}>
            <View style={styles.dayDetailStat}>
              <Ionicons name="timer-outline" size={18} color={colors.mainBlue} />
              <Text style={styles.dayDetailValue}>
                {(selectedDayData.totalHours || 0).toFixed(1)}h
              </Text>
              <Text style={styles.dayDetailLabel}>Total</Text>
            </View>
            <View style={styles.dayDetailStat}>
              <Ionicons name="list-outline" size={18} color={colors.mainOrange} />
              <Text style={styles.dayDetailValue}>
                {selectedDayData.sessionCount || 0}
              </Text>
              <Text style={styles.dayDetailLabel}>Sessions</Text>
            </View>
            <View style={styles.dayDetailStat}>
              <Ionicons
                name={selectedDayData.goalAchieved ? "checkmark-circle" : "close-circle-outline"}
                size={18}
                color={selectedDayData.goalAchieved ? colors.lima : colors.raven}
              />
              <Text style={styles.dayDetailValue}>
                {selectedDayData.goalAchieved ? "Yes" : "No"}
              </Text>
              <Text style={styles.dayDetailLabel}>Goal Met</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.dayDetailEmpty}>
          No fasting sessions on this day
        </Text>
      )}

      {sessions.length > 0 && (
        <View style={styles.sessionList}>
          <Text style={styles.sessionListTitle}>Sessions</Text>
          {sessions.map((session) => {
            const durationSeconds = session.actualDurationSeconds || 0;
            const stage = getCurrentStage(durationSeconds);
            const startDate = new Date(session.startTime);
            const dateStr = startDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <View key={session._id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionPlan}>
                      {session.fastingPlanTitle || "Custom Fast"}
                    </Text>
                    <Text style={styles.sessionTime}>
                      {dateStr}, {timeStr}
                      {session.endTime
                        ? ` → ${new Date(session.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                        : " → Ongoing"}
                    </Text>
                  </View>
                  <View style={styles.sessionActions}>
                    {session.goalAchieved && (
                      <View style={styles.goalBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.lima} />
                      </View>
                    )}
                    <TouchableOpacity onPress={() => onDeleteSession(session._id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.raven} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.sessionBody}>
                  <View style={[styles.stageIndicator, { backgroundColor: `${stage.color}20` }]}>
                    <Ionicons name={stage.icon} size={18} color={stage.color} />
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionDuration}>{secondsToShortTime(durationSeconds)}</Text>
                    <Text style={[styles.sessionStageText, { color: stage.color }]}>{stage.label}</Text>
                  </View>
                </View>

                {(() => {
                  const matched = session.stagesReached?.length
                    ? FASTING_STAGES.filter((s) => session.stagesReached.includes(s.label))
                    : [];
                  if (!matched.length) return null;
                  return (
                    <View style={styles.stagesRow}>
                      {matched.map((s) => (
                        <View key={s.label} style={[styles.stageChip, { backgroundColor: `${s.color}15` }]}>
                          <View style={[styles.stageChipDot, { backgroundColor: s.color }]} />
                          <Text style={[styles.stageChipText, { color: s.color }]}>{s.label}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dayDetailWrap: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  dayDetailDate: {
    ...typography.h4,
    color: colors.mineShaft,
    textAlign: "center",
  },
  dayDetailSummary: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  dayDetailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayDetailStat: {
    alignItems: "center",
    gap: 4,
  },
  dayDetailValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  dayDetailLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  dayDetailEmpty: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: "center",
    fontStyle: "italic",
  },

  sessionList: {
    gap: spacing.sm,
  },
  sessionListTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.mineShaft,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gallery,
    gap: spacing.sm,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionPlan: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.mineShaft,
  },
  sessionTime: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${colors.lima}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stageIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionDetails: {
    flex: 1,
  },
  sessionDuration: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  sessionStageText: {
    ...typography.caption,
    fontWeight: "600",
  },
  stagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  stageChip: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
});

export default FastingSessionList;
