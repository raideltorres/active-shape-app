import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography } from "../../theme";

const WorkoutListEmpty = ({ isFetching, favoritesOnly }) => {
  if (isFetching) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.mainOrange}
        style={styles.loader}
      />
    );
  }

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons
          name="barbell-outline"
          size={40}
          color={colors.mainOrange}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {favoritesOnly ? "No Favorite Workouts" : "No Workouts Found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or search terms
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: `${colors.mainOrange}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...typography.h4, color: colors.mineShaft },
  emptySubtitle: { ...typography.bodySmall, color: colors.raven },
});

export default React.memo(WorkoutListEmpty);
