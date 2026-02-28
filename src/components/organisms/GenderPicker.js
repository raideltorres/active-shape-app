import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const GENDER_OPTIONS = [
  { value: 'male', icon: 'male', label: 'Male' },
  { value: 'female', icon: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', icon: 'eye-off-outline', label: 'Prefer not to say' },
];

const GenderPicker = ({ value, onChange, question }) => {
  const handleSelect = useCallback(
    (v) => {
      onChange?.(v);
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      {question && <Text style={styles.question}>{question}</Text>}
      <View style={styles.options}>
        {GENDER_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              )}
              <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                <Ionicons
                  name={opt.icon}
                  size={40}
                  color={isSelected ? colors.mainOrange : colors.slateGray}
                />
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  question: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.athensGray,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    minHeight: 130,
    position: 'relative',
  },
  optionSelected: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
    shadowColor: colors.mainOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  iconWrapSelected: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    ...typography.label,
    color: colors.mineShaft,
    textAlign: 'center',
    fontSize: 13,
  },
  labelSelected: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
});

export default GenderPicker;
