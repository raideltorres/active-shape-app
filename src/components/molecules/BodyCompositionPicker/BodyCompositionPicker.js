import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';
import { BODY_COMPOSITION_TYPES } from '../../../utils/measure';

const ICON_MAP = {
  athletic_muscular: 'barbell-outline',
  fit_toned: 'walk-outline',
  average: 'person-outline',
  slim_low_muscle: 'body-outline',
  soft_higher_fat: 'scale-outline',
};

const compositionOptions = Object.values(BODY_COMPOSITION_TYPES).map((type) => ({
  value: type.value,
  label: type.label,
  description: type.description,
  icon: ICON_MAP[type.value] || 'person-outline',
}));

const BodyCompositionPicker = ({ label, question, value, onChange }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.header}>{label}</Text>}
      {question && <Text style={styles.question}>{question}</Text>}

      <View style={styles.options}>
        {compositionOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange?.(option.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={isSelected ? colors.white : colors.slateGray}
                />
              </View>

              <View style={styles.content}>
                <Text style={[styles.label, isSelected && styles.labelSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.description}>{option.description}</Text>
              </View>

              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    ...typography.h4,
    color: colors.mainBlue,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  question: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.athensGray,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.athensGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapSelected: {
    backgroundColor: colors.mainOrange,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  labelSelected: {
    color: colors.mainOrange,
  },
  description: {
    ...typography.caption,
    color: colors.raven,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mainOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BodyCompositionPicker;
