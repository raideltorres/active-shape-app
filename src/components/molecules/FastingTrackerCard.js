import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const FASTING_STAGES = [
  { name: 'Blood Sugar Drop', hours: 3, icon: 'water-outline', color: colors.havelockBlue },
  { name: 'Fat Burning', hours: 12, icon: 'flame-outline', color: colors.mainOrange },
  { name: 'Ketosis', hours: 16, icon: 'flash-outline', color: colors.purple },
  { name: 'Autophagy', hours: 24, icon: 'sparkles-outline', color: colors.lima },
];

const FastingTrackerCard = ({
  fastingPlan = null,
  fastingStarted = null,
  onStart,
  onStop,
  onSetupFasting,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
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

  // Current fasting stage
  const currentStage = useMemo(() => {
    if (!isFasting) return null;
    const hours = elapsedSeconds / 3600;
    return FASTING_STAGES.filter(s => hours >= s.hours).pop() || null;
  }, [isFasting, elapsedSeconds]);

  // No fasting plan setup - show prompt
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
            <TouchableOpacity style={styles.promptButton} onPress={onSetupFasting}>
              <Ionicons name="rocket" size={18} color={colors.white} />
              <Text style={styles.promptButtonText}>Choose a Fasting Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const fastingHours = fastingPlan.fastingTime || 16;
  const eatingHours = 24 - fastingHours;
  const goalSeconds = fastingHours * 3600;
  const progress = Math.min((elapsedSeconds / goalSeconds) * 100, 100);
  const isComplete = elapsedSeconds >= goalSeconds;
  const remainingSeconds = Math.max(0, goalSeconds - elapsedSeconds);

  const handleStop = () => {
    if (onStop) {
      // Calculate stages reached
      const stagesReached = FASTING_STAGES
        .filter(s => elapsedSeconds >= s.hours * 3600)
        .map(s => s.name);
      onStop(elapsedSeconds, stagesReached);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="timer" size={20} color={colors.purple} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Fasting Tracker</Text>
            <Text style={styles.subtitle}>
              {fastingPlan.title || `${fastingHours}:${eatingHours} Protocol`}
            </Text>
          </View>
        </View>
        {isFasting && currentStage && (
          <View style={[styles.stageBadge, { backgroundColor: `${currentStage.color}15` }]}>
            <Ionicons name={currentStage.icon} size={12} color={currentStage.color} />
            <Text style={[styles.stageText, { color: currentStage.color }]}>{currentStage.name}</Text>
          </View>
        )}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerRing, isComplete && styles.timerRingComplete]}>
          <View style={styles.timerContent}>
            {isFasting ? (
              <>
                <Text style={[styles.timerValue, isComplete && styles.timerValueComplete]}>
                  {formatTime(elapsedSeconds)}
                </Text>
                <Text style={styles.timerLabel}>
                  {isComplete ? 'Goal Reached! 🎉' : `${Math.round(progress)}% complete`}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="moon-outline" size={28} color={colors.raven} />
                <Text style={styles.timerIdle}>Not Fasting</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Goal Info */}
      <View style={styles.goalInfo}>
        <View style={styles.goalItem}>
          <Text style={styles.goalLabel}>Goal</Text>
          <Text style={styles.goalValue}>{fastingHours}h</Text>
        </View>
        <View style={styles.goalDivider} />
        <View style={styles.goalItem}>
          <Text style={styles.goalLabel}>Elapsed</Text>
          <Text style={[styles.goalValue, { color: colors.purple }]}>
            {isFasting 
              ? `${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m`
              : '--'
            }
          </Text>
        </View>
        <View style={styles.goalDivider} />
        <View style={styles.goalItem}>
          <Text style={styles.goalLabel}>Remaining</Text>
          <Text style={styles.goalValue}>
            {isFasting && !isComplete
              ? `${Math.floor(remainingSeconds / 3600)}h ${Math.floor((remainingSeconds % 3600) / 60)}m`
              : '--'
            }
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isFasting ? styles.actionButtonStop : styles.actionButtonStart,
        ]}
        onPress={isFasting ? handleStop : onStart}
      >
        <Ionicons 
          name={isFasting ? 'stop-circle' : 'play-circle'} 
          size={20} 
          color={colors.white} 
        />
        <Text style={styles.actionButtonText}>
          {isFasting ? 'End Fast' : 'Start Fasting'}
        </Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.purple}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  subtitle: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stageText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: `${colors.purple}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingComplete: {
    borderColor: `${colors.lima}30`,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.purple,
    fontVariant: ['tabular-nums'],
  },
  timerValueComplete: {
    color: colors.lima,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 4,
  },
  timerIdle: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
  },
  goalInfo: {
    flexDirection: 'row',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  goalItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalDivider: {
    width: 1,
    backgroundColor: colors.gallery,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: 4,
  },
  goalValue: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionButtonStart: {
    backgroundColor: colors.purple,
  },
  actionButtonStop: {
    backgroundColor: colors.cinnabar,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  // Prompt styles
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
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  promptButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default FastingTrackerCard;
