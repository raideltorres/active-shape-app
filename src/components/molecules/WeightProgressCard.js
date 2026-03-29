import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

import { PulsingDot, EmptyState } from '../atoms';
import CardHeader from './CardHeader';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - (spacing.lg * 4) - 40;

const WeightProgressCard = ({ 
  weightData = [],
  initialWeight,
  currentWeight,
  goalWeight,
  profileCreatedAt,
}) => {
  const chartData = useMemo(() => {
    const chartPoints = [];
    const profileWeight = initialWeight;
    const weightRecords = (weightData || [])
      .filter(d => d.weight != null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (profileWeight) {
      const toLocal = (dt) => {
        const dd = new Date(dt);
        return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`;
      };
      const profileCreatedDate = profileCreatedAt
        ? toLocal(profileCreatedAt)
        : toLocal(new Date());

      const hasEarlierData = weightRecords.some(
        (record) => new Date(record.date) <= new Date(profileCreatedDate)
      );

      if (!hasEarlierData) {
        chartPoints.push({
          date: profileCreatedDate,
          weight: profileWeight,
        });
      }
    }

    weightRecords.forEach((record) => {
      chartPoints.push({
        date: record.date,
        weight: record.weight,
      });
    });

    chartPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    return chartPoints;
  }, [weightData, initialWeight, profileCreatedAt]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        initial: currentWeight || null,
        current: currentWeight || null,
        goal: goalWeight || null,
        change: null,
      };
    }

    const firstWeight = chartData[0]?.weight;
    const lastWeight = chartData[chartData.length - 1]?.weight;
    const change = firstWeight && lastWeight && chartData.length > 1 
      ? lastWeight - firstWeight 
      : null;

    return {
      initial: firstWeight,
      current: lastWeight,
      goal: goalWeight,
      change,
    };
  }, [chartData, currentWeight, goalWeight]);

  const isLoss = stats.change !== null && stats.change < 0;
  const percentChange = stats.change !== null && stats.initial 
    ? ((Math.abs(stats.change) / stats.initial) * 100).toFixed(1)
    : null;

  // Calculate y-axis config FIRST (before lineData which depends on it)
  const yAxisConfig = useMemo(() => {
    if (chartData.length === 0) return { baseline: 0, maxValue: 100, stepValue: 25 };

    const weights = chartData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    
    // For single point or same values, create symmetric range around the value
    const range = maxWeight - minWeight;
    
    if (range === 0) {
      // Single value - create symmetric range with value at center
      const stepValue = 2; // 2kg per step
      const halfRange = stepValue * 2; // 4kg above and below
      const baseline = minWeight - halfRange;
      const maxValue = halfRange * 2; // Total range is 8kg
      
      return {
        baseline,
        maxValue,
        stepValue,
      };
    }
    
    // Multiple values - calculate appropriate range
    const padding = Math.ceil(range * 0.3) || 2;
    const baseline = Math.floor(minWeight - padding);
    const top = Math.ceil(maxWeight + padding);
    const totalRange = top - baseline;
    
    // Calculate step to get ~4 sections
    const stepValue = Math.ceil(totalRange / 4);
    const adjustedMax = stepValue * 4;

    return {
      baseline,
      maxValue: adjustedMax,
      stepValue,
    };
  }, [chartData]);

  const lineData = useMemo(() => {
    if (chartData.length === 0) return [];

    // Transform values to be relative to baseline for proper chart positioning
    const baseline = yAxisConfig.baseline;

    return chartData.map((point, index) => {
      const isLast = index === chartData.length - 1;
      const dateObj = new Date(point.date);
      const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

      return {
        value: point.weight - baseline, // Relative to baseline
        actualValue: point.weight, // Keep original for display
        label: chartData.length <= 6 ? label : (index % 2 === 0 ? label : ''),
        dataPointText: isLast ? `${point.weight}` : '',
        textColor: colors.purple,
        textFontSize: 10,
        textShiftY: -10, // Move label above the point
        customDataPoint: isLast ? () => <PulsingDot color={colors.purple} /> : undefined,
      };
    });
  }, [chartData, yAxisConfig.baseline]);

  if (chartData.length === 0 && !stats.current) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="scale-outline"
          iconSize={32}
          iconColor={colors.raven}
          title="No Weight Data Yet"
          description="Start tracking your weight to see your progress over time"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CardHeader
        icon="scale-outline"
        iconColor={colors.purple}
        title="Weight Progress"
        subtitle={chartData.length > 1 ? `${chartData.length} entries` : chartData.length === 1 ? 'Starting weight' : 'Current weight'}
        rightElement={stats.change !== null ? (
          <View style={[styles.changeBadge, isLoss ? styles.changeBadgeLoss : styles.changeBadgeGain]}>
            <Ionicons 
              name={isLoss ? 'trending-down' : 'trending-up'} 
              size={14} 
              color={isLoss ? colors.lima : colors.cinnabar} 
            />
            <Text style={[styles.changeBadgeText, isLoss ? styles.changeBadgeTextLoss : styles.changeBadgeTextGain]}>
              {isLoss ? '' : '+'}{stats.change.toFixed(1)} kg ({percentChange}%)
            </Text>
          </View>
        ) : null}
      />

      {lineData.length > 0 && (
        <View style={styles.chartContainer}>
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={120}
            animated
            animationDuration={1500}
            animateOnDataChange={false}
            color={colors.purple}
            thickness={2.5}
            areaChart
            startFillColor={`${colors.purple}40`}
            endFillColor={`${colors.purple}05`}
            startOpacity={0.4}
            endOpacity={0.05}
            dataPointsColor={colors.purple}
            dataPointsRadius={5}
            curved
            curvature={0.2}
            yAxisColor={colors.gallery}
            yAxisThickness={1}
            yAxisTextStyle={styles.axisText}
            yAxisLabelWidth={45}
            noOfSections={4}
            maxValue={yAxisConfig.maxValue}
            stepValue={yAxisConfig.stepValue}
            formatYLabel={(val) => `${Math.round(Number(val) + yAxisConfig.baseline)}`}
            xAxisColor={colors.gallery}
            xAxisThickness={1}
            xAxisLabelTextStyle={styles.axisText}
            rulesColor={`${colors.gallery}80`}
            rulesType="solid"
            hideDataPoints={false}
            spacing={lineData.length > 1 ? (CHART_WIDTH - 60) / (lineData.length - 1) : CHART_WIDTH / 2}
            initialSpacing={20}
            endSpacing={20}
          />
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Initial</Text>
          <Text style={styles.statValue}>
            {stats.initial ? `${stats.initial} kg` : '--'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={[styles.statValue, styles.statValueCurrent]}>
            {stats.current ? `${stats.current} kg` : '--'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>
            {stats.goal ? `${stats.goal} kg` : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  changeBadgeLoss: {
    backgroundColor: `${colors.lima}15`,
  },
  changeBadgeGain: {
    backgroundColor: `${colors.cinnabar}15`,
  },
  changeBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  changeBadgeTextLoss: {
    color: colors.lima,
  },
  changeBadgeTextGain: {
    color: colors.cinnabar,
  },
  chartContainer: {
    marginBottom: spacing.md,
    marginLeft: -spacing.sm,
  },
  axisText: {
    color: colors.raven,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.gallery,
  },
  statLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  statValueCurrent: {
    color: colors.purple,
  },
});

export default WeightProgressCard;
