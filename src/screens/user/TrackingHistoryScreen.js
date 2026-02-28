import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  useGetProfileQuery,
  useGetTrackingsQuery,
  useUpdateTrackingMutation,
  useDeleteTrackingFieldMutation,
  useDeleteTrackingMutation,
} from '../../store/api';
import { DateSelector } from '../../components/molecules';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getCurrentDate } from '../../utils/date';

const FIELD_CONFIG = [
  { key: 'caloriesConsumed', label: 'Calories Consumed', unit: 'kcal', icon: 'flame', color: colors.mainOrange, max: 5000, step: 10 },
  { key: 'caloriesBurned', label: 'Calories Burned', unit: 'kcal', icon: 'flame-outline', color: colors.lima, max: 3000, step: 10 },
  { key: 'water', label: 'Water', unit: 'ml', icon: 'water', color: colors.havelockBlue, max: 5000, step: 50, format: (v) => `${(v / 1000).toFixed(1)}L` },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: 'scale-outline', color: colors.mainBlue, max: 200, step: 0.1 },
  { key: 'proteins', label: 'Protein', unit: 'g', icon: 'fish-outline', color: colors.mainOrange, max: 500, step: 1 },
  { key: 'carbs', label: 'Carbs', unit: 'g', icon: 'restaurant-outline', color: colors.buttercup, max: 500, step: 1 },
  { key: 'fats', label: 'Fats', unit: 'g', icon: 'water-outline', color: colors.salmon, max: 300, step: 1 },
  { key: 'steps', label: 'Steps', unit: 'steps', icon: 'walk-outline', color: colors.lima, max: 50000, step: 100 },
  { key: 'exerciseDuration', label: 'Exercise', unit: 'min', icon: 'time-outline', color: colors.havelockBlue, max: 480, step: 5 },
];

const TrackingHistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: trackingData = [], isLoading: trackingLoading } = useGetTrackingsQuery(
    profile?._id,
    { skip: !profile?._id },
  );
  const [updateTracking, { isLoading: isUpdating }] = useUpdateTrackingMutation();
  const [deleteTrackingField, { isLoading: isDeleting }] = useDeleteTrackingFieldMutation();
  const [deleteTracking] = useDeleteTrackingMutation();

  const loading = profileLoading || trackingLoading;

  const todayData = useMemo(
    () => trackingData?.find((r) => r.date === selectedDate) || {},
    [trackingData, selectedDate],
  );

  const trackedFields = useMemo(
    () => FIELD_CONFIG.filter((f) => todayData[f.key] != null && todayData[f.key] > 0),
    [todayData],
  );

  const emptyFields = useMemo(
    () => FIELD_CONFIG.filter((f) => todayData[f.key] == null || todayData[f.key] === 0),
    [todayData],
  );

  const formatValue = useCallback((field, value) => {
    if (field.format) return field.format(value);
    if (field.unit) return `${value.toLocaleString()} ${field.unit}`;
    return value.toLocaleString();
  }, []);

  const handleEdit = useCallback((field) => {
    setEditingField(field);
    setEditValue(String(todayData[field.key] || 0));
  }, [todayData]);

  const handleEditSave = useCallback(async () => {
    if (!profile?._id || !editingField) return;
    const num = parseFloat(editValue);
    if (Number.isNaN(num) || num < 0) {
      Alert.alert('Invalid', 'Please enter a valid number.');
      return;
    }
    try {
      await updateTracking({
        userId: profile._id,
        date: selectedDate,
        field: editingField.key,
        value: num,
      }).unwrap();
      setEditingField(null);
    } catch (e) {
      if (__DEV__) console.error('Update tracking error:', e);
      Alert.alert('Error', e?.data?.message || 'Failed to update. Please try again.');
    }
  }, [profile?._id, selectedDate, editingField, editValue, updateTracking]);

  const handleDeleteField = useCallback((field) => {
    Alert.alert(
      'Delete Field',
      `Remove ${field.label.toLowerCase()} for this day?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!profile?._id) return;
            try {
              await deleteTrackingField({
                userId: profile._id,
                date: selectedDate,
                field: field.key,
              }).unwrap();
            } catch (e) {
              if (__DEV__) console.error('Delete field error:', e);
              Alert.alert('Error', e?.data?.message || 'Failed to delete.');
            }
          },
        },
      ],
    );
  }, [profile?._id, selectedDate, deleteTrackingField]);

  const handleDeleteAll = useCallback(() => {
    Alert.alert(
      'Clear Day',
      `Remove all tracking data for ${selectedDate}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            if (!profile?._id) return;
            try {
              await deleteTracking({
                userId: profile._id,
                date: selectedDate,
              }).unwrap();
            } catch (e) {
              if (__DEV__) console.error('Delete all error:', e);
              Alert.alert('Error', e?.data?.message || 'Failed to delete.');
            }
          },
        },
      ],
    );
  }, [profile?._id, selectedDate, deleteTracking]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking History</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>View, edit, or delete your daily tracked data</Text>

        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} maxDaysBack={7} />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.mainOrange} />
          </View>
        ) : trackedFields.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tracked Data</Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleDeleteAll}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.clearBtnText}>Clear Day</Text>
              </TouchableOpacity>
            </View>

            {trackedFields.map((field) => (
              <View key={field.key} style={styles.fieldCard}>
                <View style={[styles.fieldIconWrap, { backgroundColor: `${field.color}18` }]}>
                  <Ionicons name={field.icon} size={22} color={field.color} />
                </View>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{formatValue(field, todayData[field.key])}</Text>
                </View>
                <View style={styles.fieldActions}>
                  <TouchableOpacity onPress={() => handleEdit(field)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color={colors.mainBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteField(field)} disabled={isDeleting} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {emptyFields.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Not Tracked</Text>
                <View style={styles.emptyFieldsWrap}>
                  {emptyFields.map((field) => (
                    <View key={field.key} style={styles.emptyField}>
                      <Ionicons name={field.icon} size={18} color={colors.raven} />
                      <Text style={styles.emptyFieldLabel}>{field.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.noData}>
            <Ionicons name="analytics-outline" size={48} color={colors.alto} />
            <Text style={styles.noDataTitle}>No data tracked</Text>
            <Text style={styles.noDataText}>No tracking data found for this day. Use the Tracking page to log your daily metrics.</Text>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <Modal
        visible={!!editingField}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingField?.label}</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.modalUnit}>{editingField?.unit}</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingField(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, isUpdating && styles.modalSaveDisabled]}
                onPress={handleEditSave}
                disabled={isUpdating}
              >
                <Text style={styles.modalSaveText}>{isUpdating ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.alabaster },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: { width: 40 },
  headerTitle: { ...typography.h3, color: colors.mineShaft, textAlign: 'center' },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.tabBarPadding },
  subtitle: { ...typography.body, color: colors.raven, textAlign: 'center', marginBottom: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xxxl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h4, color: colors.mineShaft },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearBtnText: { ...typography.caption, color: colors.error, fontWeight: '600' },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  fieldInfo: { flex: 1 },
  fieldLabel: { ...typography.bodySmall, color: colors.raven, marginBottom: 2 },
  fieldValue: { ...typography.h4, color: colors.mineShaft },
  fieldActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { padding: spacing.xs },
  emptyFieldsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.athensGray,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyFieldLabel: { ...typography.bodySmall, color: colors.raven },
  noData: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  noDataTitle: { ...typography.h4, color: colors.mineShaft, marginTop: spacing.md },
  noDataText: { ...typography.body, color: colors.raven, textAlign: 'center', marginTop: spacing.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: { ...typography.h3, color: colors.mineShaft, marginBottom: spacing.lg },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.h4,
    textAlign: 'center',
  },
  modalUnit: { ...typography.body, color: colors.raven },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  modalCancelText: { ...typography.body, color: colors.raven },
  modalSave: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.mainOrange,
  },
  modalSaveDisabled: { opacity: 0.6 },
  modalSaveText: { ...typography.body, color: colors.white, fontWeight: '600' },
});

export default TrackingHistoryScreen;
