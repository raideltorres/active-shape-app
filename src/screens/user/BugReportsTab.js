import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { Button, ConfirmModal, EmptyState } from '../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shadows } from '../../theme/shadows';
import { BUG_CATEGORIES, BUG_STATUS_LABELS, BUG_STATUS_COLORS } from '../../utils/measure';
import {
  useCreateBugReportMutation,
  useGetMyBugReportsQuery,
  useDeleteMyBugReportMutation,
} from '../../store/api';

const STATUS_DOT_COLORS = {
  ...Object.fromEntries(
    Object.entries(BUG_STATUS_COLORS).map(([k, v]) => [
      k,
      v === 'orange' ? colors.buttercup
        : v === 'blue' ? colors.havelockBlue
        : v === 'green' ? colors.lima
        : colors.raven,
    ]),
  ),
};

const BugReportsTab = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [createBugReport, { isLoading: isSubmitting }] = useCreateBugReportMutation();
  const [deleteMyBugReport] = useDeleteMyBugReportMutation();
  const { data: myReports } = useGetMyBugReportsQuery();

  const atLimit = myReports?.length >= 10;

  const pickScreenshot = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to attach screenshots.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setScreenshots((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  }, []);

  const removeScreenshot = useCallback((idx) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory(null);
    setScreenshots([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || title.trim().length < 5) {
      Toast.show({ type: 'error', text1: 'Title must be at least 5 characters' });
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      Toast.show({ type: 'error', text1: 'Description must be at least 10 characters' });
      return;
    }
    try {
      await createBugReport({
        title: title.trim(),
        description: description.trim(),
        category,
        screenshots,
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Bug report submitted!', text2: 'Thank you for helping us improve.' });
      resetForm();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to submit report' });
    }
  }, [title, description, category, screenshots, createBugReport, resetForm]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteMyBugReport(deleteId).unwrap();
      Toast.show({ type: 'success', text1: 'Report deleted' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete report' });
    }
    setConfirmVisible(false);
    setDeleteId(null);
  }, [deleteId, deleteMyBugReport]);

  return (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bug-outline" size={20} color={colors.mainOrange} />
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Report a Bug</Text>
          <Text style={styles.sectionSubtitle}>Spotted something broken? Tell us what happened.</Text>
        </View>
      </View>

      {atLimit ? (
        <View style={styles.limitNotice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.buttercup} />
          <Text style={styles.limitText}>
            You've reached the maximum of 10 bug reports. Please wait for an existing report to be resolved.
          </Text>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipWrap}>
            {BUG_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.chip, category === cat.value && styles.chipActive]}
                onPress={() => setCategory(category === cat.value ? null : cat.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of the issue"
            placeholderTextColor={colors.raven}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What happened? What did you expect? Steps to reproduce."
            placeholderTextColor={colors.raven}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={5000}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Screenshots (optional, up to 5)</Text>
          <View style={styles.screenshotRow}>
            {screenshots.map((uri, idx) => (
              <View key={uri} style={styles.screenshotThumb}>
                <Image source={{ uri }} style={styles.screenshotImage} />
                <TouchableOpacity style={styles.screenshotRemove} onPress={() => removeScreenshot(idx)}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {screenshots.length < 5 && (
              <TouchableOpacity style={styles.screenshotAdd} onPress={pickScreenshot} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color={colors.raven} />
              </TouchableOpacity>
            )}
          </View>

          <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Report'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            icon="send-outline"
          />
        </View>
      )}

      {myReports?.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>My Reports</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{myReports.length}</Text>
            </View>
          </View>
          {myReports.map((report) => (
            <View key={report._id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={2}>{report.title}</Text>
                <View style={styles.itemMeta}>
                  {report.category && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {BUG_CATEGORIES.find((c) => c.value === report.category)?.name ?? report.category}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statusTag}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_DOT_COLORS[report.status] || colors.raven }]} />
                    <Text style={styles.statusText}>
                      {BUG_STATUS_LABELS[report.status] ?? report.status}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.itemDesc} numberOfLines={3}>{report.description}</Text>
              {report.screenshots?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshotListScroll}>
                  <View style={styles.screenshotListRow}>
                    {report.screenshots.map((url) => (
                      <Image key={url} source={{ uri: url }} style={styles.screenshotListImage} />
                    ))}
                  </View>
                </ScrollView>
              )}
              {report.adminNote && (
                <View style={styles.adminNote}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.havelockBlue} />
                  <Text style={styles.adminNoteText}>
                    <Text style={styles.adminNoteLabel}>Admin: </Text>
                    {report.adminNote}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => { setDeleteId(report._id); setConfirmVisible(true); }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {myReports?.length === 0 && (
        <EmptyState icon="bug-outline" iconColor={colors.gallery} title="No bug reports yet" />
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Report"
        message="This will permanently delete the bug report."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmVisible(false); setDeleteId(null); }}
        icon="trash-outline"
        iconColor={colors.error}
        destructive
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.raven,
    marginTop: 2,
  },
  limitNotice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: `${colors.buttercup}14`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  limitText: {
    ...typography.caption,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.mineShaft,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.alabaster,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  chipActive: {
    backgroundColor: `${colors.mainOrange}14`,
    borderColor: colors.mainOrange,
  },
  chipText: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.mainOrange,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.alabaster,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    color: colors.mineShaft,
    borderWidth: 1,
    borderColor: colors.gallery,
  },
  textArea: {
    minHeight: 100,
  },
  screenshotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  screenshotThumb: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
  },
  screenshotRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  screenshotAdd: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gallery,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  listTitle: {
    ...typography.h3,
    color: colors.mineShaft,
  },
  countBadge: {
    backgroundColor: `${colors.mainOrange}14`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
  },
  countBadgeText: {
    ...typography.caption,
    color: colors.mainOrange,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.subtle,
  },
  itemHeader: {
    gap: spacing.xs,
  },
  itemTitle: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.raven,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.alabaster,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    color: colors.mineShaft,
    fontWeight: '500',
  },
  itemDesc: {
    ...typography.caption,
    color: colors.raven,
    lineHeight: 20,
  },
  screenshotListScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  screenshotListRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  screenshotListImage: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.md,
  },
  adminNote: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: `${colors.havelockBlue}0A`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'flex-start',
  },
  adminNoteText: {
    ...typography.caption,
    color: colors.mineShaft,
    flex: 1,
    lineHeight: 18,
  },
  adminNoteLabel: {
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteBtnText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '500',
  },
});

export default BugReportsTab;
