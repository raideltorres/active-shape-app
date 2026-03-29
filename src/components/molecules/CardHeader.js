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

const CardHeader = ({
  icon,
  iconFamily = 'ionicons',
  iconColor,
  iconBg,
  title,
  subtitle,
  rightElement,
  style,
}) => {
  const IconComponent = ICON_FAMILIES[iconFamily] || Ionicons;
  const bgColor = iconBg || `${iconColor}15`;

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <IconComponent name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightElement}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.mineShaft,
  },
  subtitle: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
});

export default CardHeader;
