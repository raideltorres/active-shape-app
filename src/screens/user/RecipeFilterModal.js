import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import FilterCardSelect from "../../components/atoms/FilterCardSelect";
import RangeSlider from "../../components/atoms/RangeSlider";
import Ribbon from "../../components/atoms/Ribbon";
import Button from "../../components/atoms/Button";
import { colors, spacing, typography, borderRadius } from "../../theme";

// Match web options (value for API, label for display)
export const DIET_OPTIONS = [
  { value: "", label: "Select diet" },
  { value: "keto", label: "Keto" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "paleo", label: "Paleo" },
  { value: "gluten free", label: "Gluten Free" },
  { value: "lacto vegetarian", label: "Lacto-Vegetarian" },
  { value: "ovo vegetarian", label: "Ovo-Vegetarian" },
  { value: "pescetarian", label: "Pescetarian" },
  { value: "primal", label: "Primal" },
  { value: "whole30", label: "Whole30" },
];

export const DISH_TYPE_OPTIONS = [
  { value: "", label: "Select dish type" },
  { value: "main course", label: "Main Course" },
  { value: "side dish", label: "Side Dish" },
  { value: "dessert", label: "Dessert" },
  { value: "appetizer", label: "Appetizer" },
  { value: "salad", label: "Salad" },
  { value: "bread", label: "Bread" },
  { value: "breakfast", label: "Breakfast" },
  { value: "soup", label: "Soup" },
  { value: "beverage", label: "Beverage" },
  { value: "sauce", label: "Sauce" },
  { value: "drink", label: "Drink" },
];

// Slider max values (match web)
export const CALORIES_MAX = 1500;
export const CARBS_MAX = 140;
export const PROTEIN_MAX = 60;
export const FAT_MAX = 30;
export const FIBER_MAX = 30;

const RecipeFilterModal = ({
  visible,
  onClose,
  filterForm,
  onFilterFormChange,
  onApply,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.raven} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.modalBody}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.filterBlock}>
            <FilterCardSelect
              label="Diet Type"
              title="Diet"
              value={filterForm.diet}
              options={DIET_OPTIONS}
              placeholder="Select diet"
              onSelect={(v) => onFilterFormChange({ diet: v })}
            />
          </View>

          <View style={styles.filterBlock}>
            <FilterCardSelect
              label="Dish Type"
              title="Dish type"
              value={filterForm.type}
              options={DISH_TYPE_OPTIONS}
              placeholder="Select dish type"
              onSelect={(v) => onFilterFormChange({ type: v })}
            />
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minCalories)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxCalories)}
                  </Text>
                  {" Kcal"}
                </Text>
              </View>
              <Ribbon>Calories</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={CALORIES_MAX}
                step={50}
                value={[filterForm.minCalories, filterForm.maxCalories]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({
                    minCalories: min,
                    maxCalories: max,
                  })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minCarbs)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxCarbs)}
                  </Text>
                  {" g"}
                </Text>
              </View>
              <Ribbon>Carbohydrates</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={CARBS_MAX}
                step={5}
                value={[filterForm.minCarbs, filterForm.maxCarbs]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({
                    minCarbs: min,
                    maxCarbs: max,
                  })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minProtein)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxProtein)}
                  </Text>
                  {" g"}
                </Text>
              </View>
              <Ribbon>Proteins</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={PROTEIN_MAX}
                step={5}
                value={[filterForm.minProtein, filterForm.maxProtein]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({
                    minProtein: min,
                    maxProtein: max,
                  })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minFat)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxFat)}
                  </Text>
                  {" g"}
                </Text>
              </View>
              <Ribbon>Fats</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={FAT_MAX}
                step={2}
                value={[filterForm.minFat, filterForm.maxFat]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({ minFat: min, maxFat: max })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minSaturatedFat)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxSaturatedFat)}
                  </Text>
                  {" g"}
                </Text>
              </View>
              <Ribbon>Saturated fats</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={FAT_MAX}
                step={2}
                value={[
                  filterForm.minSaturatedFat,
                  filterForm.maxSaturatedFat,
                ]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({
                    minSaturatedFat: min,
                    maxSaturatedFat: max,
                  })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>

          <View style={styles.filterBlock}>
            <View style={styles.sliderCard}>
              <View style={styles.sliderCardHeaderRow}>
                <Text style={styles.sliderValueWeb}>
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.minFiber)}
                  </Text>
                  {" to "}
                  <Text style={styles.sliderValueWebBold}>
                    {Math.round(filterForm.maxFiber)}
                  </Text>
                  {" g"}
                </Text>
              </View>
              <Ribbon>Fibers</Ribbon>
              <RangeSlider
                minimumValue={0}
                maximumValue={FIBER_MAX}
                step={2}
                value={[filterForm.minFiber, filterForm.maxFiber]}
                onValueChange={([min, max]) =>
                  onFilterFormChange({
                    minFiber: min,
                    maxFiber: max,
                  })
                }
                minimumTrackTintColor={colors.mainOrange}
                maximumTrackTintColor={colors.gallery}
                thumbTintColor={colors.mainOrange}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <Button title="Apply" onPress={onApply} variant="secondary" />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "94%",
    flexDirection: "column",
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gallery,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalBody: {
    padding: spacing.lg,
    flex: 1,
  },
  modalFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 16,
  },
  filterBlock: {
    marginBottom: spacing.lg,
  },
  filterUnit: {
    ...typography.caption,
    color: colors.raven,
    marginLeft: spacing.sm,
  },
  sliderCard: {
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
  sliderCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingRight: 88,
  },
  sliderValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.mineShaft,
    marginBottom: spacing.sm,
  },
  sliderValueWeb: {
    ...typography.body,
    color: colors.mineShaft,
  },
  sliderValueWebBold: {
    fontWeight: "700",
  },
});

export default RecipeFilterModal;
