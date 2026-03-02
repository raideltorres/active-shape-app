import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const MENU_ITEMS = [
  { key: 'profile', label: 'Profile', icon: 'person-outline', tab: 'ProfileTab' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', tab: 'ProfileTab', screen: 'Settings' },
  { key: 'logout', label: 'Sign Out', icon: 'log-out-outline', danger: true },
];

const ProfileMenu = ({ visible, onClose, anchorPosition }) => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const handlePress = useCallback((item) => {
    onClose();

    if (item.key === 'logout') {
      signOut();
      return;
    }

    if (item.tab) {
      navigation.navigate(item.tab, item.screen ? { screen: item.screen } : undefined);
    }
  }, [navigation, signOut, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.menu, anchorPosition && { top: anchorPosition.y, right: spacing.lg }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? colors.error : colors.mineShaft}
              />
              <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  menu: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xs,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  menuLabel: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '500',
  },
  menuLabelDanger: {
    color: colors.error,
  },
});

export default ProfileMenu;
