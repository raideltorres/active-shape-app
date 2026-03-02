import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ProfileMenu } from "../molecules";
import { colors, spacing, typography } from "../../theme";

const TabScreenLayout = ({
  children,
  title,
  subtitle,
  greeting,
  showHeader = true,
  showProfileButton = true,
  contentContainerStyle,
  backgroundColor = colors.alabaster,
  scrollable = true,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  edges = ["top"],
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const profileBtnRef = useRef(null);

  const handleProfilePress = useCallback(() => {
    profileBtnRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ y: y + height + 4 });
      setMenuVisible(true);
    });
  }, []);

  const renderHeader = () => {
    if (!showHeader || !title) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {greeting && <Text style={styles.headerGreeting}>{greeting}</Text>}
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {showProfileButton && (
          <TouchableOpacity
            ref={profileBtnRef}
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={colors.mainOrange}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!scrollable) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={edges}
      >
        <View style={[styles.content, contentContainerStyle]}>
          {renderHeader()}
          {children}
        </View>
        <ProfileMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          anchorPosition={menuAnchor}
        />
      </SafeAreaView>
    );
  }

  const scrollView = (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardAvoiding ? "handled" : undefined}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.mainOrange}
          />
        ) : undefined
      }
    >
      {renderHeader()}
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {scrollView}
        </KeyboardAvoidingView>
      ) : (
        scrollView
      )}
      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchorPosition={menuAnchor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.tabBarPadding,
  },
  tabBarSpacer: {
    height: spacing.tabBarPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    ...typography.body,
    color: colors.raven,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.mineShaft,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
});

export default TabScreenLayout;
