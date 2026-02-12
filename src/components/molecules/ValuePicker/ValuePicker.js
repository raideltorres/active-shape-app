import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

import { colors, spacing, typography, borderRadius } from "../../../theme";

const SLIDER_BUTTON_SIZE = 36;
const SLIDER_ROW_RESERVED = SLIDER_BUTTON_SIZE * 2 + spacing.sm * 2;
const SLIDER_THUMB_RADIUS = 10;
const SLIDER_TRACK_PADDING = SLIDER_THUMB_RADIUS;

/** Only digits, max 3 (for integer part). */
const INT_PATTERN = /^\d{0,3}$/;
/** Only digits, max 1 (for decimal part). */
const DEC_PATTERN = /^\d{0,1}$/;

const splitDecimal = (s) => {
  const str = String(s).replace(",", ".");
  const i = str.indexOf(".");
  if (i < 0) return [str, ""];
  return [str.slice(0, i), str.slice(i + 1).slice(0, 1)];
};

/**
 * Reusable value picker with main unit, slider (+/-), and optional alternative unit.
 * Matches web ValuePicker API: formatted display, single-thumb slider, optional save button.
 */
const ValuePicker = ({
  title,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  alternativeUnit,
  convertToAlternative,
  convertFromAlternative,
  formatMainValue = (n) => String(n),
  formatAlternativeValue = (n) => String(Math.round(n)),
  showSaveButton = false,
  onSave,
  loading = false,
  saveButtonLabel = "Save",
}) => {
  const [sliderLength, setSliderLength] = useState(240);
  const [editingMain, setEditingMain] = useState(null);
  const [editingAlt, setEditingAlt] = useState(null);

  const numValue = useMemo(() => {
    const n = parseFloat(String(value).replace(",", "."), 10);
    return Number.isNaN(n) ? min : Math.max(min, Math.min(max, n));
  }, [value, min, max]);

  const alternativeValue = useMemo(() => {
    if (convertToAlternative) return convertToAlternative(numValue);
    return null;
  }, [numValue, convertToAlternative]);

  const displayMain = formatMainValue(numValue);
  const displayAlt =
    alternativeValue != null ? formatAlternativeValue(alternativeValue) : "";

  const commitMain = useCallback(
    (raw) => {
      const n = parseFloat(String(raw).replace(",", "."), 10);
      if (!Number.isNaN(n)) {
        const clamped = Math.max(min, Math.min(max, n));
        onChange?.(formatMainValue(clamped));
      } else {
        onChange?.(formatMainValue(min));
      }
      setEditingMain(null);
    },
    [onChange, min, max, formatMainValue],
  );

  const commitAlt = useCallback(
    (raw) => {
      if (!convertFromAlternative) return;
      const n = parseFloat(String(raw).replace(",", "."), 10);
      if (!Number.isNaN(n)) {
        const main = convertFromAlternative(n);
        const clamped = Math.max(min, Math.min(max, main));
        onChange?.(formatMainValue(clamped));
      }
      setEditingAlt(null);
    },
    [onChange, min, max, convertFromAlternative, formatMainValue],
  );

  const handleSliderChange = useCallback(
    (values) => {
      const v = values[0];
      const rounded = Math.round(v / step) * step;
      onChange?.(formatMainValue(rounded));
    },
    [onChange, step, formatMainValue],
  );

  const decrement = useCallback(() => {
    const next = Math.max(min, numValue - step);
    onChange?.(formatMainValue(next));
  }, [numValue, min, step, onChange, formatMainValue]);

  const increment = useCallback(() => {
    const next = Math.min(max, numValue + step);
    onChange?.(formatMainValue(next));
  }, [numValue, max, step, onChange, formatMainValue]);

  const mainInputValue = editingMain !== null ? editingMain : displayMain;
  const altInputValue = editingAlt !== null ? editingAlt : displayAlt;
  const [mainInt, mainDec] = useMemo(
    () => splitDecimal(mainInputValue),
    [mainInputValue],
  );
  const [altInt, altDec] = useMemo(
    () => splitDecimal(altInputValue),
    [altInputValue],
  );

  const handleMainFocus = useCallback(() => {
    setEditingMain(value || displayMain);
  }, [value, displayMain]);

  const handleMainBlur = useCallback(() => {
    if (editingMain !== null) commitMain(mainInputValue);
  }, [editingMain, commitMain, mainInputValue]);

  const handleMainIntChange = useCallback(
    (text) => {
      if (!INT_PATTERN.test(text)) return;
      const combined = mainDec ? `${text}.${mainDec}` : text;
      setEditingMain(combined || "");
    },
    [mainDec],
  );

  const handleMainDecChange = useCallback(
    (text) => {
      if (!DEC_PATTERN.test(text)) return;
      const combined = text ? `${mainInt}.${text}` : mainInt;
      setEditingMain(combined);
    },
    [mainInt],
  );

  const handleAltFocus = useCallback(() => {
    setEditingAlt(displayAlt);
  }, [displayAlt]);

  const handleAltBlur = useCallback(() => {
    if (editingAlt !== null) commitAlt(altInputValue);
  }, [editingAlt, commitAlt, altInputValue]);

  const handleAltIntChange = useCallback(
    (text) => {
      if (!INT_PATTERN.test(text)) return;
      const combined = altDec ? `${text}.${altDec}` : text;
      setEditingAlt(combined || "");
    },
    [altDec],
  );

  const handleAltDecChange = useCallback(
    (text) => {
      if (!DEC_PATTERN.test(text)) return;
      const combined = text ? `${altInt}.${text}` : altInt;
      setEditingAlt(combined);
    },
    [altInt],
  );

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {title || description ? <View style={styles.orangeDivider} /> : null}

      <View style={styles.mainColumn}>
        <View style={styles.valueRow}>
          <View style={styles.valueBlock}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.valueInput}
                value={mainInt || "0"}
                onChangeText={handleMainIntChange}
                onFocus={handleMainFocus}
                onBlur={handleMainBlur}
                keyboardType="decimal-pad"
                maxLength={3}
                includeFontPadding={false}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.decimalSep}>.</Text>
            <View style={[styles.inputWrap, styles.inputWrapDecimal]}>
              <TextInput
                style={[styles.valueInput, styles.valueInputDecimal]}
                value={mainDec || "0"}
                onChangeText={handleMainDecChange}
                onFocus={handleMainFocus}
                onBlur={handleMainBlur}
                keyboardType="decimal-pad"
                maxLength={1}
                includeFontPadding={false}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.unit}>{unit}</Text>
          </View>
        </View>

        <View
          style={styles.sliderRow}
          onLayout={(e) => setSliderLength(e.nativeEvent.layout.width)}
        >
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={decrement}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={20} color={colors.mainOrange} />
          </TouchableOpacity>
          <View style={styles.sliderTrack}>
            <MultiSlider
              values={[numValue]}
              min={min}
              max={max}
              step={step}
              sliderLength={Math.max(120, sliderLength - SLIDER_ROW_RESERVED - SLIDER_TRACK_PADDING * 2)}
              onValuesChangeFinish={handleSliderChange}
              selectedStyle={styles.sliderSelected}
              unselectedStyle={styles.sliderUnselected}
              markerStyle={styles.sliderThumb}
              touchDimensions={{ height: 36, width: 36 }}
            />
          </View>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={increment}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.mainOrange} />
          </TouchableOpacity>
        </View>

        {alternativeUnit != null && alternativeValue != null && (
          <View style={styles.valueRow}>
            <View style={styles.valueBlock}>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.valueInput}
                  value={altInt || "0"}
                  onChangeText={handleAltIntChange}
                  onFocus={handleAltFocus}
                  onBlur={handleAltBlur}
                  keyboardType="decimal-pad"
                  maxLength={3}
                  includeFontPadding={false}
                  selectTextOnFocus
                />
              </View>
              <Text style={styles.decimalSep}>.</Text>
              <View style={[styles.inputWrap, styles.inputWrapDecimal]}>
                <TextInput
                  style={[styles.valueInput, styles.valueInputDecimal]}
                  value={altDec || "0"}
                  onChangeText={handleAltDecChange}
                  onFocus={handleAltFocus}
                  onBlur={handleAltBlur}
                  keyboardType="decimal-pad"
                  maxLength={1}
                  includeFontPadding={false}
                  selectTextOnFocus
                />
              </View>
              <Text style={styles.unit}>{alternativeUnit}</Text>
            </View>
          </View>
        )}
      </View>

      {showSaveButton && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={18}
                color={colors.white}
                style={styles.saveIcon}
              />
              <Text style={styles.saveButtonText}>{saveButtonLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    ...typography.h4,
    color: colors.mainBlue,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  orangeDivider: {
    height: 2,
    backgroundColor: colors.mainOrange,
    marginBottom: spacing.lg,
  },
  mainColumn: {
    marginBottom: spacing.lg,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: spacing.xs,
  },
  valueBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 90,
  },
  inputWrap: {
    position: "relative",
    minHeight: 28,
    minWidth: 32,
    justifyContent: "center",
  },
  inputWrapDecimal: {
    minWidth: 18,
  },
  valueInput: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.mineShaft,
    minWidth: 32,
    minHeight: 28,
    lineHeight: 19,
    padding: 0,
    textAlign: "center",
    textAlignVertical: "center",
  },
  valueInputDecimal: {
    minWidth: 20,
  },
  decimalSep: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.raven,
    paddingHorizontal: 0,
    padding: 0,
    marginLeft: 2,
  },
  unit: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.raven,
    marginLeft: spacing.xs,
    paddingBottom: 2,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
    paddingVertical: 10,
  },
  sliderButton: {
    width: SLIDER_BUTTON_SIZE,
    height: SLIDER_BUTTON_SIZE,
    minWidth: SLIDER_BUTTON_SIZE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.mainOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: SLIDER_TRACK_PADDING,
  },
  sliderSelected: {
    backgroundColor: colors.mainOrange,
  },
  sliderUnselected: {
    backgroundColor: colors.gallery,
  },
  sliderThumb: {
    backgroundColor: colors.mainOrange,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mainOrange,
    backgroundColor: colors.mainOrange,
    minWidth: 200,
  },
  saveIcon: {
    marginRight: spacing.sm,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default ValuePicker;
