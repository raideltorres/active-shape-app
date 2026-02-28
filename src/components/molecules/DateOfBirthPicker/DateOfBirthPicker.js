import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MIN_AGE = 13;

const DateOfBirthPicker = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();
  const maxBirthYear = currentYear - MIN_AGE;

  const parsed = useMemo(() => {
    if (!value) return { year: null, month: null, day: null };
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return { year: null, month: null, day: null };
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, [value]);

  const [step, setStep] = useState(parsed.year ? 'display' : 'year');
  const [selectedYear, setSelectedYear] = useState(parsed.year);
  const [selectedMonth, setSelectedMonth] = useState(parsed.month);

  const years = useMemo(() => {
    const yrs = [];
    for (let y = maxBirthYear; y >= 1920; y--) yrs.push(y);
    return yrs;
  }, [maxBirthYear]);

  const daysInMonth = useMemo(() => {
    if (selectedYear == null || selectedMonth == null) return [];
    const count = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  const handleYearSelect = useCallback((y) => {
    setSelectedYear(y);
    setStep('month');
  }, []);

  const handleMonthSelect = useCallback((m) => {
    setSelectedMonth(m);
    setStep('day');
  }, []);

  const handleDaySelect = useCallback(
    (d) => {
      const date = new Date(selectedYear, selectedMonth, d);
      onChange?.(date.toISOString());
      setStep('display');
    },
    [selectedYear, selectedMonth, onChange],
  );

  const handleEdit = useCallback(() => {
    setStep('year');
  }, []);

  if (step === 'display' && value) {
    const d = new Date(value);
    const display = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    return (
      <TouchableOpacity style={styles.displayCard} onPress={handleEdit} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={20} color={colors.mainOrange} />
        <Text style={styles.displayText}>{display}</Text>
        <Ionicons name="pencil-outline" size={18} color={colors.raven} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>
        {step === 'year' ? 'Select Year' : step === 'month' ? 'Select Month' : 'Select Day'}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {step === 'year' &&
          years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.cell, selectedYear === y && styles.cellActive]}
              onPress={() => handleYearSelect(y)}
            >
              <Text style={[styles.cellText, selectedYear === y && styles.cellTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}

        {step === 'month' &&
          MONTHS.map((m, i) => (
            <TouchableOpacity
              key={m}
              style={[styles.cell, styles.cellWide, selectedMonth === i && styles.cellActive]}
              onPress={() => handleMonthSelect(i)}
            >
              <Text style={[styles.cellText, selectedMonth === i && styles.cellTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}

        {step === 'day' &&
          daysInMonth.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.cell, parsed.day === d && styles.cellActive]}
              onPress={() => handleDaySelect(d)}
            >
              <Text style={[styles.cellText, parsed.day === d && styles.cellTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
  },
  stepLabel: {
    ...typography.label,
    color: colors.mainBlue,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 280,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  cell: {
    width: 70,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
    alignItems: 'center',
  },
  cellWide: {
    width: 100,
  },
  cellActive: {
    backgroundColor: colors.mainOrange,
    borderColor: colors.mainOrange,
  },
  cellText: {
    ...typography.body,
    color: colors.mineShaft,
  },
  cellTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  displayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
    justifyContent: 'center',
  },
  displayText: {
    ...typography.h4,
    color: colors.mainOrange,
    flex: 1,
    textAlign: 'center',
  },
});

export default DateOfBirthPicker;
