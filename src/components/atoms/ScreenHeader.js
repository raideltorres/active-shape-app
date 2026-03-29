import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const ScreenHeader = ({ title, onBack, rightElement, titleColor, iconColor, style }) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity onPress={onBack || (() => navigation.goBack())} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={iconColor || colors.mineShaft} />
      </TouchableOpacity>
      <Text style={[styles.title, titleColor && { color: titleColor }]}>{title}</Text>
      {rightElement || <View style={styles.placeholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  placeholder: {
    width: 40,
  },
});

export default ScreenHeader;
