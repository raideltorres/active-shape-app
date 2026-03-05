import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../../../theme';
import {
  useGetSupplementsQuery,
  useCreateSupplementMutation,
  useUpdateSupplementMutation,
  useDeleteSupplementMutation,
} from '../../../store/api';

const SupplementsTab = () => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { data: supplements = [], isLoading } = useGetSupplementsQuery();
  const [createSupplement, { isLoading: isCreating }] = useCreateSupplementMutation();
  const [updateSupplement] = useUpdateSupplementMutation();
  const [deleteSupplement] = useDeleteSupplementMutation();

  const resetForm = useCallback(() => {
    setName('');
    setDosage('');
    setNotes('');
    setEditingId(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;

    try {
      const body = { name: name.trim() };
      if (dosage.trim()) body.dosage = dosage.trim();
      if (notes.trim()) body.notes = notes.trim();

      if (editingId) {
        await updateSupplement({ id: editingId, ...body }).unwrap();
      } else {
        await createSupplement(body).unwrap();
      }

      resetForm();
    } catch {
      Alert.alert('Error', 'Failed to save supplement. Please try again.');
    }
  }, [name, dosage, notes, editingId, createSupplement, updateSupplement, resetForm]);

  const handleEdit = useCallback((supplement) => {
    setEditingId(supplement._id);
    setName(supplement.name);
    setDosage(supplement.dosage || '');
    setNotes(supplement.notes || '');
  }, []);

  const handleDelete = useCallback(
    (supplement) => {
      Alert.alert(
        'Delete Supplement',
        `Delete "${supplement.name}"? This will also remove all its logs.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSupplement(supplement._id).unwrap();
              } catch {
                Alert.alert('Error', 'Failed to delete supplement.');
              }
            },
          },
        ],
      );
    },
    [deleteSupplement],
  );

  const handleToggleActive = useCallback(
    async (supplement) => {
      try {
        await updateSupplement({ id: supplement._id, active: !supplement.active }).unwrap();
      } catch {
        Alert.alert('Error', 'Failed to update supplement.');
      }
    },
    [updateSupplement],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </View>
    );
  }

  const activeCount = supplements.filter((s) => s.active).length;

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={16} color={colors.mainOrange} />
        <Text style={styles.bannerText}>
          Active supplements appear in your daily checklist above. Toggle them off when not taking them.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.havelockBlue}15` }]}>
            <Ionicons name="add" size={18} color={colors.havelockBlue} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>{editingId ? 'Edit Supplement' : 'Add Supplement'}</Text>
            <Text style={styles.cardSubtitle}>
              {editingId ? 'Update the details below' : 'Add to your daily routine'}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="e.g. Creatine Monohydrate"
              placeholderTextColor={colors.alto}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="e.g. 5g"
              placeholderTextColor={colors.alto}
              value={dosage}
              onChangeText={setDosage}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Optional notes (e.g. take with food)"
            placeholderTextColor={colors.alto}
            value={notes}
            onChangeText={setNotes}
          />
          <View style={styles.formActions}>
            {editingId && (
              <TouchableOpacity onPress={resetForm} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || isCreating}
              activeOpacity={0.7}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>{editingId ? 'Update' : 'Add'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.lima}15` }]}>
            <MaterialCommunityIcons name="pill" size={18} color={colors.lima} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>My Supplements</Text>
            <Text style={styles.cardSubtitle}>
              {supplements.length > 0
                ? `${activeCount} active out of ${supplements.length}`
                : 'No supplements added yet'}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          {supplements.length === 0 ? (
            <View style={styles.emptyBlock}>
              <MaterialCommunityIcons name="pill" size={28} color={colors.alto} />
              <Text style={styles.emptyText}>No supplements added yet</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {supplements.map((supplement) => (
                <View
                  key={supplement._id}
                  style={[styles.listItem, !supplement.active && styles.listItemInactive]}
                >
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemName}>{supplement.name}</Text>
                    {supplement.dosage && (
                      <Text style={styles.listItemDosage}>{supplement.dosage}</Text>
                    )}
                    {supplement.notes && (
                      <Text style={styles.listItemNotes}>{supplement.notes}</Text>
                    )}
                  </View>
                  <View style={styles.listItemActions}>
                    <Switch
                      value={supplement.active}
                      onValueChange={() => handleToggleActive(supplement)}
                      trackColor={{ false: colors.alto, true: `${colors.lima}60` }}
                      thumbColor={supplement.active ? colors.lima : colors.gallery}
                    />
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEdit(supplement)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil-outline" size={16} color={colors.raven} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(supplement)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.cinnabar} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md + 2,
    backgroundColor: `${colors.mainOrange}08`,
    borderWidth: 1,
    borderColor: `${colors.mainOrange}18`,
    borderRadius: borderRadius.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.raven,
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.alabaster,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typography.label,
    color: colors.mineShaft,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.raven,
  },
  cardBody: {
    padding: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.bodySmall,
    color: colors.mineShaft,
    backgroundColor: colors.alabaster,
    marginBottom: spacing.sm,
  },
  inputFlex: {
    flex: 1,
  },
  inputSmall: {
    width: 90,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.raven,
  },
  submitButton: {
    backgroundColor: colors.mainOrange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  listItemInactive: {
    opacity: 0.5,
  },
  listItemInfo: {
    flex: 1,
    gap: 2,
  },
  listItemName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.mineShaft,
  },
  listItemDosage: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.mainOrange,
  },
  listItemNotes: {
    ...typography.caption,
    color: colors.raven,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.gallery,
  },
  emptyText: {
    ...typography.caption,
    color: colors.alto,
  },
});

export default SupplementsTab;
