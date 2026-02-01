import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

/**
 * Generic layout for scrollable screens with form inputs
 * Handles SafeAreaView, KeyboardAvoidingView, and ScrollView
 * 
 * @param {React.ReactNode} children - Screen content
 * @param {Object} contentContainerStyle - Additional styles for ScrollView content
 * @param {string} backgroundColor - Override background color (defaults to white)
 */
const ScrollableFormLayout = ({ 
  children, 
  contentContainerStyle,
  backgroundColor = colors.white,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});

export default ScrollableFormLayout;
