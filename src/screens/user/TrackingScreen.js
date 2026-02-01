import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const TrackingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Tracking</Text>
          <Text style={styles.subtitle}>Monitor your nutrition & habits</Text>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          {weekDays.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                isSelected(date) && styles.dateItemSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateDayName,
                  isSelected(date) && styles.dateDayNameSelected,
                ]}
              >
                {dayNames[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  isSelected(date) && styles.dateNumberSelected,
                  isToday(date) && !isSelected(date) && styles.dateNumberToday,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calories Card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.caloriesTitle}>Calories</Text>
            <Text style={styles.caloriesRemaining}>850 remaining</Text>
          </View>
          <View style={styles.caloriesProgress}>
            <View style={styles.caloriesBar}>
              <View style={[styles.caloriesBarFill, { width: '60%' }]} />
            </View>
            <View style={styles.caloriesStats}>
              <Text style={styles.caloriesConsumed}>1,150 eaten</Text>
              <Text style={styles.caloriesGoal}>of 2,000</Text>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macrosGrid}>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: `${colors.havelockBlue}15` }]}>
                <Text style={styles.macroEmoji}>🥩</Text>
              </View>
              <Text style={styles.macroValue}>85g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={styles.macroProgress}>
                <View style={[styles.macroBar, { backgroundColor: colors.havelockBlue, width: '70%' }]} />
              </View>
            </View>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: `${colors.mainOrange}15` }]}>
                <Text style={styles.macroEmoji}>🍞</Text>
              </View>
              <Text style={styles.macroValue}>150g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={styles.macroProgress}>
                <View style={[styles.macroBar, { backgroundColor: colors.mainOrange, width: '55%' }]} />
              </View>
            </View>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: `${colors.lima}15` }]}>
                <Text style={styles.macroEmoji}>🥑</Text>
              </View>
              <Text style={styles.macroValue}>45g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
              <View style={styles.macroProgress}>
                <View style={[styles.macroBar, { backgroundColor: colors.lima, width: '65%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration</Text>
          <View style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <View style={styles.waterIconContainer}>
                <Ionicons name="water" size={24} color={colors.havelockBlue} />
              </View>
              <View style={styles.waterInfo}>
                <Text style={styles.waterValue}>1.5L / 2.5L</Text>
                <Text style={styles.waterLabel}>Water intake today</Text>
              </View>
            </View>
            <View style={styles.waterGlasses}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                <View
                  key={glass}
                  style={[
                    styles.waterGlass,
                    glass <= 6 && styles.waterGlassFilled,
                  ]}
                >
                  <Ionicons
                    name="water"
                    size={16}
                    color={glass <= 6 ? colors.havelockBlue : colors.gallery}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quick Log Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Log</Text>
          <View style={styles.quickLogGrid}>
            <TouchableOpacity style={styles.quickLogButton}>
              <Ionicons name="cafe-outline" size={24} color={colors.mainOrange} />
              <Text style={styles.quickLogLabel}>Breakfast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLogButton}>
              <Ionicons name="restaurant-outline" size={24} color={colors.lima} />
              <Text style={styles.quickLogLabel}>Lunch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLogButton}>
              <Ionicons name="moon-outline" size={24} color={colors.havelockBlue} />
              <Text style={styles.quickLogLabel}>Dinner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLogButton}>
              <Ionicons name="nutrition-outline" size={24} color={colors.purple} />
              <Text style={styles.quickLogLabel}>Snack</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.mineShaft,
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  dateItemSelected: {
    backgroundColor: colors.mainOrange,
  },
  dateDayName: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: 4,
  },
  dateDayNameSelected: {
    color: colors.white,
  },
  dateNumber: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  dateNumberSelected: {
    color: colors.white,
  },
  dateNumberToday: {
    color: colors.mainOrange,
  },
  caloriesCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  caloriesTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  caloriesRemaining: {
    ...typography.body,
    color: colors.lima,
    fontWeight: '600',
  },
  caloriesProgress: {},
  caloriesBar: {
    height: 12,
    backgroundColor: colors.gallery,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  caloriesBarFill: {
    height: '100%',
    backgroundColor: colors.mainOrange,
    borderRadius: 6,
  },
  caloriesStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caloriesConsumed: {
    ...typography.bodySmall,
    color: colors.mineShaft,
    fontWeight: '500',
  },
  caloriesGoal: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.mineShaft,
    marginBottom: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  macroEmoji: {
    fontSize: 20,
  },
  macroValue: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.raven,
    marginBottom: spacing.xs,
  },
  macroProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.gallery,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 2,
  },
  waterCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  waterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${colors.havelockBlue}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  waterInfo: {
    flex: 1,
  },
  waterValue: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  waterLabel: {
    ...typography.caption,
    color: colors.raven,
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlass: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gallery,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlassFilled: {
    backgroundColor: `${colors.havelockBlue}20`,
  },
  quickLogGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickLogButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLogLabel: {
    ...typography.caption,
    color: colors.mineShaft,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

export default TrackingScreen;
