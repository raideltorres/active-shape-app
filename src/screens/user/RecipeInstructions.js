import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../theme';

const RecipeInstructions = ({ steps, completedSteps, onToggleStep }) => {
  if (!steps?.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instructions</Text>
      {steps.map((step) => {
        const completed = completedSteps.has(step.number);
        return (
          <TouchableOpacity
            key={step.number}
            style={[styles.stepCard, completed && styles.stepCardCompleted]}
            onPress={() => onToggleStep(step.number)}
            activeOpacity={0.7}
          >
            <View style={styles.stepHeader}>
              <View style={[styles.stepCheckbox, completed && styles.stepCheckboxChecked]}>
                {completed && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
              <Text style={styles.stepNumber}>Step {step.number}</Text>
              {step.length ? (
                <Text style={styles.stepDuration}>
                  {step.length.number} {step.length.unit}
                </Text>
              ) : null}
            </View>
            <Text style={styles.stepText}>{step.step}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  stepCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.alabaster,
    borderLeftWidth: 4,
    borderLeftColor: colors.mainOrange,
  },
  stepCardCompleted: {
    opacity: 0.85,
    borderLeftColor: colors.lima,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.mainOrange,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCheckboxChecked: {
    backgroundColor: colors.lima,
    borderColor: colors.lima,
  },
  stepNumber: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  stepDuration: {
    ...typography.caption,
    color: colors.raven,
  },
  stepText: {
    ...typography.body,
    lineHeight: 22,
  },
});

export default RecipeInstructions;
