import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../atoms';
import { FASTING_STAGES, getCurrentStage, getStagesReachedLabels } from '../../constants/fasting';
import { colors, spacing, typography, borderRadius } from '../../theme';

const formatTimeDigit = (value) => value.toString().padStart(2, '0');

const TimeDigit = ({ value, label }) => (
  <View style={styles.digitContainer}>
    <View style={styles.digitBox}>
      <Text style={styles.digitText}>{formatTimeDigit(value)}</Text>
    </View>
    <Text style={styles.digitLabel}>{label}</Text>
  </View>
);

const TimeSeparator = () => (
  <View style={styles.separatorContainer}>
    <Text style={styles.separator}>:</Text>
  </View>
);

const FastingTrackerCard = ({
  fastingPlan = null,
  fastingStarted = null,
  onStart,
  onStop,
  onSetupFasting,
  onViewHistory,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedStage, setSelectedStage] = useState(FASTING_STAGES[0]);

  const isFasting = useMemo(() => {
    return !!fastingStarted && new Date(fastingStarted) <= new Date();
  }, [fastingStarted]);

  useEffect(() => {
    let interval;
    if (isFasting && fastingStarted) {
      const startTime = new Date(fastingStarted).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(Math.max(0, elapsed));
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFasting, fastingStarted]);

  const currentStage = useMemo(() => getCurrentStage(elapsedSeconds), [elapsedSeconds]);

  useEffect(() => {
    if (isFasting && currentStage) {
      setSelectedStage(currentStage);
    }
  }, [isFasting, currentStage]);

  if (!fastingPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.promptContent}>
          <View style={styles.promptIconContainer}>
            <Ionicons name="timer-outline" size={32} color={colors.purple} />
          </View>
          <Text style={styles.promptTitle}>Explore Intermittent Fasting</Text>
          <Text style={styles.promptDescription}>
            Boost your metabolism and energy levels with intermittent fasting. Choose a plan that fits your lifestyle.
          </Text>
          {onSetupFasting && (
            <Button
              title="Choose a Fasting Plan"
              onPress={onSetupFasting}
              icon="rocket"
            />
          )}
        </View>
      </View>
    );
  }

  const fastingHours = fastingPlan.fastingTime || 16;
  const goalSeconds = fastingHours * 3600;
  const progress = Math.min((elapsedSeconds / goalSeconds) * 100, 100);

  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const handleStop = () => {
    if (onStop) {
      const stagesReached = getStagesReachedLabels(elapsedSeconds);
      onStop(elapsedSeconds, stagesReached);
    }
  };

  const isStageReached = (stage) => elapsedSeconds >= stage.value;
  const isStageActive = (stage) => currentStage?.label === stage.label && isFasting;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{fastingPlan.title || `${fastingHours} Hours`}</Text>
          <Text style={styles.headerSubtitle}>Goal: {fastingHours} hours</Text>
        </View>
        <Button
          title={isFasting ? 'End Fast' : 'Start Fast'}
          onPress={isFasting ? handleStop : onStart}
          icon={isFasting ? 'stop' : 'play'}
          variant="ghost"
          color={isFasting ? colors.cinnabar : colors.lima}
        />
      </View>

      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <TimeDigit value={hours} label="hours" />
          <TimeSeparator />
          <TimeDigit value={mins} label="mins" />
          <TimeSeparator />
          <TimeDigit value={secs} label="secs" />
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          <View style={[styles.progressDot, { left: `${Math.min(progress, 98)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>0h</Text>
          <Text style={styles.progressLabel}>{fastingHours}h</Text>
        </View>
      </View>

      <View style={styles.stagesSection}>
        <View style={styles.stagesGrid}>
          {FASTING_STAGES.map((stage) => {
            const reached = isStageReached(stage);
            const active = isStageActive(stage);
            const selected = selectedStage?.label === stage.label;

            return (
              <TouchableOpacity
                key={stage.label}
                style={[
                  styles.stageItem,
                  selected && styles.stageItemSelected,
                  active && styles.stageItemActive,
                ]}
                onPress={() => setSelectedStage(stage)}
              >
                {active && (
                  <View style={styles.stageActiveIndicator}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.lima} />
                  </View>
                )}
                <View style={[
                  styles.stageIconContainer,
                  { backgroundColor: reached ? `${stage.color}20` : colors.alabaster },
                ]}>
                  <Ionicons
                    name={stage.icon}
                    size={18}
                    color={reached ? stage.color : colors.raven}
                  />
                </View>
                <Text style={[
                  styles.stageName,
                  reached && { color: colors.mineShaft },
                ]}>{stage.label}</Text>
                <Text style={styles.stageHours}>{Math.round(stage.value / 3600)}h</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedStage && (
          <View style={styles.stageDescription}>
            <Text style={[styles.stageDescTitle, { color: selectedStage.color }]}>
              {selectedStage.label}
            </Text>
            <Text style={styles.stageDescText}>
              {selectedStage.longDescription || selectedStage.description}
            </Text>
          </View>
        )}
      </View>

      {onViewHistory && (
        <TouchableOpacity style={styles.historyLink} onPress={onViewHistory} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={16} color={colors.mainBlue} />
          <Text style={styles.historyLinkText}>View Fasting History</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mainBlue} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.mainOrange,
    marginTop: 2,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  digitContainer: {
    alignItems: 'center',
  },
  digitBox: {
    flexDirection: 'row',
  },
  digitText: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.mainOrange,
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
    minWidth: 48,
    textAlign: 'center',
    overflow: 'hidden',
  },
  digitLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: spacing.xs,
  },
  separatorContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  separator: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.mineShaft,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gallery,
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.lima,
    borderRadius: 3,
  },
  progressDot: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lima,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  stagesSection: {
    marginTop: spacing.sm,
  },
  stagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  stageItem: {
    width: '33.33%',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  stageItemSelected: {
    backgroundColor: colors.alabaster,
  },
  stageItemActive: {
    borderWidth: 1,
    borderColor: colors.lima,
  },
  stageActiveIndicator: {
    position: 'absolute',
    top: 4,
    right: 8,
  },
  stageIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stageName: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
    textAlign: 'center',
  },
  stageHours: {
    ...typography.caption,
    color: colors.alto,
    fontSize: 10,
    marginTop: 2,
  },
  stageDescription: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  stageDescTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  stageDescText: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
  },
  historyLinkText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.mainBlue,
  },
  promptContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  promptIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.purple}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  promptTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  promptDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
});

export default FastingTrackerCard;
