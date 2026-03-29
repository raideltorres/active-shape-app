import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { useAuth } from "../../hooks/useAuth";
import ScreenHeader from '../../components/atoms/ScreenHeader';
import { colors, spacing, typography, borderRadius } from "../../theme";
import { shadows } from '../../theme/shadows';

const WEB_URLS = {
  terms: "https://www.active-shape.com/terms-of-service",
  privacy: "https://www.active-shape.com/privacy-policy",
  referralTerms: "https://www.active-shape.com/referral-terms",
  dataDeletion: "https://www.active-shape.com/user-data-deletion",
};

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleItemPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.url) {
      WebBrowser.openBrowserAsync(item.url);
    }
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: "person-outline", label: "Edit Profile", screen: "Profile" },
        { icon: "lock-closed-outline", label: "Change Password", screen: "ChangePassword" },
      ],
    },
    {
      title: "Subscription",
      items: [
        {
          icon: "diamond-outline",
          label: "My Subscription",
          screen: "Subscription",
        },
        {
          icon: "card-outline",
          label: "Payment Methods",
          screen: "PaymentMethods",
        },
        {
          icon: "receipt-outline",
          label: "Billing History",
          screen: "Invoices",
        },
        {
          icon: "share-social-outline",
          label: "Referral Program",
          screen: "Referrals",
        },
      ],
    },
    {
      title: "Content",
      items: [
        { icon: "newspaper-outline", label: "Blog", screen: "Blog" },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          label: "Help & Support",
          screen: "Help",
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          url: WEB_URLS.terms,
        },
        {
          icon: "shield-checkmark-outline",
          label: "Privacy Policy",
          url: WEB_URLS.privacy,
        },
        {
          icon: "people-outline",
          label: "Referral Terms",
          url: WEB_URLS.referralTerms,
        },
        {
          icon: "trash-outline",
          label: "Data Deletion",
          url: WEB_URLS.dataDeletion,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" />

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 &&
                      styles.settingItemBorder,
                  ]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={item.screen || item.url ? 0.7 : 1}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={colors.mineShaft}
                      />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.hasToggle ? (
                      <Switch
                        value={false}
                        trackColor={{
                          false: colors.gallery,
                          true: colors.mainOrange,
                        }}
                        thumbColor={colors.white}
                      />
                    ) : item.value ? (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.raven}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  group: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    ...typography.caption,
    color: colors.raven,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.card,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.alabaster,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.mineShaft,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    ...typography.body,
    color: colors.raven,
    marginRight: spacing.xs,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
  version: {
    ...typography.caption,
    color: colors.raven,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});

export default SettingsScreen;
