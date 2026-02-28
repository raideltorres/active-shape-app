import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const currentYear = new Date().getFullYear();
const maxBirthYear = currentYear - 13;

const DECADES = [];
for (let d = Math.floor(maxBirthYear / 10) * 10; d >= 1920; d -= 10) {
  DECADES.push(d);
}

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month - 1, 1).getDay();

const STEPS = ['decade', 'year', 'month', 'day', 'confirm'];

const Tile = ({ children, isSelected, onPress, small, sub, width }) => (
  <TouchableOpacity
    style={[
      styles.tile,
      small && styles.tileSmall,
      isSelected && styles.tileSelected,
      width != null && { width },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.tileText, small && styles.tileTextSmall, isSelected && styles.tileTextSelected]}>
      {children}
    </Text>
    {sub && (
      <Text style={[styles.tileSub, isSelected && styles.tileSubSelected]}>{sub}</Text>
    )}
  </TouchableOpacity>
);

const DateOfBirthPicker = ({ value, onChange }) => {
  const initialDate = value ? new Date(value) : null;
  const isValidInit = initialDate && !isNaN(initialDate.getTime());
  const hasInitialized = useRef(false);

  const [step, setStep] = useState(isValidInit ? 'confirm' : 'decade');
  const [decade, setDecade] = useState(isValidInit ? Math.floor(initialDate.getFullYear() / 10) * 10 : null);
  const [year, setYear] = useState(isValidInit ? initialDate.getFullYear() : null);
  const [month, setMonth] = useState(isValidInit ? initialDate.getMonth() + 1 : null);
  const [day, setDay] = useState(isValidInit ? initialDate.getDate() : null);

  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasInitialized.current && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setDecade(Math.floor(d.getFullYear() / 10) * 10);
        setYear(d.getFullYear());
        setMonth(d.getMonth() + 1);
        setDay(d.getDate());
        setStep('confirm');
      }
      hasInitialized.current = true;
    }
  }, [value]);

  const animateTransition = useCallback((forward = true) => {
    const startX = forward ? 200 : -200;
    slideAnim.setValue(startX);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        stiffness: 300,
        damping: 30,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const goForward = useCallback((nextStep) => {
    animateTransition(true);
    setStep(nextStep);
  }, [animateTransition]);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      animateTransition(false);
      setStep(STEPS[idx - 1]);
    }
  }, [step, animateTransition]);

  const handleDecadeSelect = useCallback((d) => {
    setDecade(d);
    goForward('year');
  }, [goForward]);

  const handleYearSelect = useCallback((y) => {
    setYear(y);
    goForward('month');
  }, [goForward]);

  const handleMonthSelect = useCallback((m) => {
    setMonth(m);
    if (day) {
      const maxDay = getDaysInMonth(m, year);
      if (day > maxDay) setDay(null);
    }
    goForward('day');
  }, [day, year, goForward]);

  const handleDaySelect = useCallback((d) => {
    setDay(d);
    const date = new Date(year, month - 1, d);
    onChange?.(date);
    goForward('confirm');
  }, [year, month, onChange, goForward]);

  const handlePickAgain = useCallback(() => {
    setDecade(null);
    setYear(null);
    setMonth(null);
    setDay(null);
    animateTransition(false);
    setStep('decade');
  }, [animateTransition]);

  const progressIndex = STEPS.indexOf(step);

  const tileWidth = useCallback(
    (cols) => {
      if (!containerWidth) return undefined;
      return Math.floor((containerWidth - TILE_GAP * (cols - 1)) / cols);
    },
    [containerWidth],
  );

  const handleContentLayout = useCallback((e) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const yearsInDecade = useMemo(() => {
    if (!decade) return [];
    const arr = [];
    const maxYear = Math.min(decade + 9, maxBirthYear);
    for (let y = decade; y <= maxYear; y++) arr.push(y);
    return arr;
  }, [decade]);

  const calendarDays = useMemo(() => {
    if (!month || !year) return [];
    const daysCount = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysCount; d++) cells.push(d);
    return cells;
  }, [month, year]);

  const age = useMemo(() => {
    if (!year || !month || !day) return null;
    const birth = new Date(year, month - 1, day);
    const now = new Date();
    let a = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) a--;
    return a >= 0 && a < 150 ? a : null;
  }, [year, month, day]);

  const dayOfWeek = useMemo(() => {
    if (!year || !month || !day) return '';
    return DAY_NAMES[new Date(year, month - 1, day).getDay()];
  }, [year, month, day]);

  const renderProgress = () => (
    <View style={styles.progress}>
      {STEPS.slice(0, 4).map((s, i) => (
        <View
          key={s}
          style={[
            styles.progressDot,
            i <= progressIndex && styles.progressDotActive,
            i === progressIndex && styles.progressDotCurrent,
          ]}
        />
      ))}
    </View>
  );

  const renderBreadcrumbs = () => {
    const crumbs = [];
    if (year && step !== 'decade' && step !== 'year') {
      crumbs.push(
        <View key="year" style={styles.breadcrumb}>
          <Text style={styles.breadcrumbLabel}>YEAR </Text>
          <Text style={styles.breadcrumbValue}>{year}</Text>
        </View>,
      );
    }
    if (month && step === 'day') {
      crumbs.push(
        <View key="month" style={styles.breadcrumb}>
          <Text style={styles.breadcrumbLabel}>MONTH </Text>
          <Text style={styles.breadcrumbValue}>{MONTHS_FULL[month - 1]}</Text>
        </View>,
      );
    }
    return crumbs.length > 0 ? <View style={styles.breadcrumbs}>{crumbs}</View> : null;
  };

  const stepTitles = {
    decade: 'When were you born?',
    year: 'Which year?',
    month: 'Which month?',
    day: 'Pick the day',
    confirm: 'All set!',
  };

  return (
    <View style={styles.container}>
      <Animated.View
        onLayout={handleContentLayout}
        style={[
          styles.stepWrap,
          { transform: [{ translateX: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{stepTitles[step]}</Text>
            {renderProgress()}
          </View>
          {step !== 'decade' && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={step === 'confirm' ? handlePickAgain : goBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={13} color={colors.slateGray} />
              <Text style={styles.backBtnText}>
                {step === 'confirm' ? 'Pick again' : 'Back'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {renderBreadcrumbs()}

        {step === 'decade' && (
          <View style={styles.grid}>
            {DECADES.map((d) => (
              <Tile key={d} isSelected={d === decade} onPress={() => handleDecadeSelect(d)} width={tileWidth(3)}>
                {d}s
              </Tile>
            ))}
          </View>
        )}

        {step === 'year' && (
          <View style={styles.grid}>
            {yearsInDecade.map((y) => (
              <Tile key={y} isSelected={y === year} onPress={() => handleYearSelect(y)} width={tileWidth(3)}>
                {y}
              </Tile>
            ))}
          </View>
        )}

        {step === 'month' && (
          <View style={styles.grid}>
            {MONTHS_SHORT.map((m, i) => (
              <Tile
                key={m}
                isSelected={i + 1 === month}
                onPress={() => handleMonthSelect(i + 1)}
                sub={MONTHS_FULL[i]}
                width={tileWidth(4)}
              >
                {m}
              </Tile>
            ))}
          </View>
        )}

        {step === 'day' && (
          <>
            <View style={styles.grid}>
              {DAY_HEADERS.map((dh) => (
                <View key={dh} style={[styles.dayHeaderCell, { width: tileWidth(7) }]}>
                  <Text style={styles.dayHeaderText}>{dh}</Text>
                </View>
              ))}
              {calendarDays.map((d, i) =>
                d === null ? (
                  <View key={`empty-${i}`} style={[styles.tileEmpty, { width: tileWidth(7) }]} />
                ) : (
                  <Tile key={d} small isSelected={d === day} onPress={() => handleDaySelect(d)} width={tileWidth(7)}>
                    {d}
                  </Tile>
                ),
              )}
            </View>
          </>
        )}

        {step === 'confirm' && (
          <View style={styles.confirm}>
            <View style={styles.confirmIcon}>
              <Ionicons name="checkmark" size={24} color={colors.mainOrange} />
            </View>
            <Text style={styles.confirmDate}>
              {MONTHS_FULL[(month || 1) - 1]} {day}, {year}
            </Text>
            <Text style={styles.confirmDay}>Born on a {dayOfWeek}</Text>
            {age !== null && (
              <View style={styles.confirmAge}>
                <Ionicons name="gift-outline" size={14} color={colors.mainOrange} />
                <Text style={styles.confirmAgeLabel}>AGE</Text>
                <Text style={styles.confirmAgeValue}>{age}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const TILE_GAP = 8;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  stepWrap: {
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.mainBlue,
  },

  // Progress
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.athensGray,
  },
  progressDotActive: {
    backgroundColor: colors.mainOrange,
  },
  progressDotCurrent: {
    backgroundColor: colors.mainBlue,
  },

  // Back button
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.athensGray,
    backgroundColor: colors.white,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slateGray,
  },

  // Breadcrumbs
  breadcrumbs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: `${colors.mainBlue}0C`,
  },
  breadcrumbLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.slateGray,
    letterSpacing: 0.3,
  },
  breadcrumbValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mainBlue,
  },

  // Grids
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },

  // Tiles
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.athensGray,
    backgroundColor: colors.alabaster,
  },
  tileSmall: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  tileSelected: {
    borderColor: colors.mainOrange,
    backgroundColor: colors.mainOrange,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  tileText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  tileTextSmall: {
    fontSize: 14,
  },
  tileTextSelected: {
    color: colors.white,
  },
  tileSub: {
    fontSize: 10,
    color: colors.raven,
    marginTop: 2,
    opacity: 0.6,
  },
  tileSubSelected: {
    color: colors.white,
    opacity: 0.85,
  },
  tileEmpty: {
    minHeight: 40,
  },

  // Day headers
  dayHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Confirmation
  confirm: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.mainOrange}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  confirmDate: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.mainBlue,
    letterSpacing: -0.5,
  },
  confirmDay: {
    fontSize: 14,
    color: colors.slateGray,
  },
  confirmAge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.athensGray,
    marginTop: spacing.sm,
  },
  confirmAgeLabel: {
    fontSize: 13,
    color: colors.slateGray,
    fontWeight: '500',
  },
  confirmAgeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.mainBlue,
  },
});

export default DateOfBirthPicker;
