import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography, borderRadius } from "../../theme";
import Ribbon from "./Ribbon";

const DROPDOWN_MAX_HEIGHT = 280;
const DROPDOWN_GAP = 2;

/**
 * Reusable filter card with ribbon label and a select trigger.
 * Opens a dropdown attached below the trigger (not a full-screen modal).
 *
 * @param {string} label - Ribbon label (e.g. "Diet Type", "Dish Type")
 * @param {string} [title] - Optional title shown top-left
 * @param {string} value - Current selected value (option value)
 * @param {{ value: string, label: string }[]} options - Options (include empty value for placeholder if needed)
 * @param {string} placeholder - Shown when no value selected
 * @param {(value: string) => void} onSelect - Called when an option is selected
 */
const FilterCardSelect = ({
  label,
  title,
  value,
  options = [],
  placeholder = "Select",
  onSelect,
}) => {
  const triggerRef = useRef(null);
  const [dropdownLayout, setDropdownLayout] = useState(null);
  const open = Boolean(dropdownLayout);

  const displayText = value
    ? (options.find((o) => o.value === value)?.label ?? placeholder)
    : placeholder;
  const hasValue = Boolean(value);

  const openDropdown = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownLayout({ x, y, width, height });
    });
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownLayout(null);
  }, []);

  const handleSelect = useCallback(
    (optionValue) => {
      onSelect?.(optionValue);
      closeDropdown();
    },
    [onSelect, closeDropdown],
  );

  return (
    <View style={styles.card}>
      <Ribbon>{label}</Ribbon>
      <View style={styles.headerRow}>
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.trigger}
        onPress={openDropdown}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerTextBase,
            hasValue ? styles.triggerText : styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.raven}
          style={styles.triggerIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          {dropdownLayout && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[
                styles.dropdown,
                {
                  left: dropdownLayout.x,
                  top: dropdownLayout.y + dropdownLayout.height + DROPDOWN_GAP,
                  width: dropdownLayout.width,
                  maxHeight: DROPDOWN_MAX_HEIGHT,
                },
              ]}
            >
              <ScrollView
                style={styles.dropdownScroll}
                contentContainerStyle={styles.dropdownScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {options.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value ?? "empty"}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleSelect(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={22}
                          color={colors.mainOrange}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: colors.mercury,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    overflow: "visible",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingRight: 88,
    minHeight: 32,
  },
  headerTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: "600",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    paddingRight: 40,
  },
  triggerTextBase: {
    ...typography.body,
    width: "100%",
    marginRight: spacing.sm,
  },
  triggerText: {
    color: colors.mineShaft,
  },
  triggerPlaceholder: {
    color: colors.raven,
  },
  triggerIcon: {
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    maxHeight: DROPDOWN_MAX_HEIGHT,
  },
  dropdownScrollContent: {
    paddingVertical: spacing.xs,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(217, 87, 37, 0.1)",
  },
  dropdownItemText: {
    ...typography.body,
  },
  dropdownItemTextSelected: {
    color: colors.mainOrange,
    fontWeight: "600",
  },
});

export default FilterCardSelect;
