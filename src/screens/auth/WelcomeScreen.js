import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/atoms/Button';
import { colors, spacing, typography, borderRadius } from '../../theme';
import LogoImage from '../../assets/images/logo.png';

const FEATURES = [
  {
    icon: 'restaurant-outline',
    title: 'Taste Sensations',
    description: 'Explore thousands of curated recipes with nutrition analysis and cooking tips.',
    color: colors.mainOrange,
  },
  {
    icon: 'fitness-outline',
    title: 'Fitness Frontiers',
    description: 'Discover workouts from high-intensity training to mindful yoga sessions.',
    color: colors.havelockBlue,
  },
  {
    icon: 'water-outline',
    title: 'Wellness Journal',
    description: 'Track water intake, calories, weight progress, and more in one place.',
    color: colors.lima,
  },
  {
    icon: 'analytics-outline',
    title: 'Insightful Analytics',
    description: 'Gain valuable insights with AI-powered analysis of your health journey.',
    color: colors.purple,
  },
];

const FeatureCard = ({ icon, title, description, color, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, index]);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.mainOrange, '#E86A3E', '#F08A5D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <SafeAreaView edges={['top']} style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.heroSubtitle}>
              Your personal fitness companion for tracking meals, workouts, and reaching your goals.
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5K+</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100+</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>AI</Text>
                <Text style={styles.statLabel}>Powered</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionLabel}>OUR SERVICES</Text>
          <Text style={styles.sectionTitle}>Everything you need to get in shape</Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to transform?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of users achieving their fitness goals every day.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <SafeAreaView edges={['bottom']} style={styles.bottomActions}>
        <View style={styles.actionsContainer}>
          <Button title="Get Started" onPress={() => navigation.navigate('Register')} />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180, // Space for fixed bottom actions
  },
  // Hero Section
  heroSection: {
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Services Section
  servicesSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.codGray,
    marginBottom: spacing.xl,
  },
  featuresGrid: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.label,
    fontWeight: '600',
    color: colors.codGray,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
  },
  // CTA Section
  ctaSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  ctaTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ctaSubtitle: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
  },
  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.mainOrange,
  },
});

export default WelcomeScreen;
