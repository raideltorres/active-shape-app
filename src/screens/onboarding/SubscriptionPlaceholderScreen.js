import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/atoms/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '../../theme';

const SubscriptionPlaceholderScreen = () => {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={64} color={colors.mainOrange} />
        </View>

        <Text style={styles.title}>You're all set!</Text>

        <Text style={styles.subtitle}>
          Your onboarding is complete. We have everything we need to create your
          personalized health and fitness plan.
        </Text>

        <View style={styles.card}>
          <Ionicons name="card-outline" size={32} color={colors.mainBlue} />
          <Text style={styles.cardTitle}>Subscription Coming Soon</Text>
          <Text style={styles.cardText}>
            We're putting the finishing touches on our subscription plans.
            You'll be notified as soon as they're ready so you can unlock your
            personalized plan, AI-powered insights, and premium features.
          </Text>
        </View>

        <Button
          title="Sign Out"
          onPress={signOut}
          variant="secondary"
          style={styles.signOutBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.mainOrange}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.mainBlue,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.athensGray,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xxl,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.mainBlue,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cardText: {
    ...typography.bodySmall,
    color: colors.raven,
    textAlign: 'center',
    lineHeight: 22,
  },
  signOutBtn: {
    width: '100%',
  },
});

export default SubscriptionPlaceholderScreen;
