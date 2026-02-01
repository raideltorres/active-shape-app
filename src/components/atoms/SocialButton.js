import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography, borderRadius, colors } from '../../theme';

/**
 * Social authentication button component
 * @param {Object} provider - Provider config with id, name, icon, color, bgColor, textColor
 * @param {Function} onPress - Called with provider.id when pressed
 * @param {boolean} loading - Shows loading indicator when true
 */
const SocialButton = ({ provider, onPress, loading = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: provider.bgColor },
        provider.id === 'google' && styles.outlined,
      ]}
      onPress={() => onPress(provider.id)}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={provider.color} />
      ) : (
        <>
          <Ionicons name={provider.icon} size={20} color={provider.color} />
          <Text style={[styles.text, { color: provider.textColor }]}>
            Continue with {provider.name}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.alto,
  },
  text: {
    ...typography.label,
    fontWeight: '600',
  },
});

export default SocialButton;
