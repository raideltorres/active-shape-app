import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const ICON_FAMILIES = {
  ionicons: Ionicons,
  material: MaterialCommunityIcons,
};

const EmptyState = ({
  icon,
  iconFamily = 'ionicons',
  iconSize = 48,
  iconColor = colors.mercury,
  title,
  description,
  style,
}) => {
  const IconComponent = ICON_FAMILIES[iconFamily] || Ionicons;

  return (
    <View style={[styles.container, style]}>
      <IconComponent name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.raven,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default EmptyState;
