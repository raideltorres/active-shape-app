import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';

const GENDERS = [
  { value: 'male', label: 'Male', icon: 'male' },
  { value: 'female', label: 'Female', icon: 'female' },
  { value: 'other', label: 'Other', icon: 'person' },
];

const GenderPicker = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {GENDERS.map((gender) => {
        const active = value === gender.value;
        return (
          <TouchableOpacity
            key={gender.value}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onChange?.(gender.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
              <Ionicons
                name={gender.icon}
                size={32}
                color={active ? colors.white : colors.raven}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {gender.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gallery,
    backgroundColor: colors.white,
  },
  cardActive: {
    borderColor: colors.mainOrange,
    backgroundColor: `${colors.mainOrange}08`,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.alabaster,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircleActive: {
    backgroundColor: colors.mainOrange,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  labelActive: {
    color: colors.mainOrange,
  },
});

export default GenderPicker;
