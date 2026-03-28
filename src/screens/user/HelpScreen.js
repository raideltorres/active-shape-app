import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { TabScreenLayout } from '../../components/templates';
import { Button, ConfirmModal } from '../../components/atoms';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  BUG_CATEGORIES,
  BUG_STATUS_LABELS,
  BUG_STATUS_COLORS,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUS_LABELS,
  SUGGESTION_STATUS_COLORS,
} from '../../utils/measure';
import {
  useGetFaqsQuery,
  useCreateBugReportMutation,
  useGetMyBugReportsQuery,
  useDeleteMyBugReportMutation,
  useCreateSuggestionMutation,
  useGetMySuggestionsQuery,
  useToggleUpvoteMutation,
  useDeleteMySuggestionMutation,
} from '../../store/api';
import { useGetProfileQuery } from '../../store/api';

const TABS = [
  { key: 'faq', label: 'FAQ', icon: 'help-circle-outline' },
  { key: 'bugs', label: 'Bug Reports', icon: 'bug-outline' },
  { key: 'suggestions', label: 'Suggestions', icon: 'bulb-outline' },
];

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

const SUGGESTION_DOT_COLORS = {
  ...Object.fromEntries(
    Object.entries(SUGGESTION_STATUS_COLORS).map(([k, v]) => [
      k,
      v === 'blue' ? colors.havelockBlue
        : v === 'green' ? colors.lima
        : v === 'red' ? colors.error
        : v === 'purple' ? '#8b5cf6'
        : colors.raven,
    ]),
  ),
};

const HelpScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <TabScreenLayout
      title="Help & Support"
      subtitle="Browse questions, report bugs, or share ideas."
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={tab.icon} size={16} color={isActive ? colors.mainOrange : colors.raven} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'faq' && <FaqTab />}
      {activeTab === 'bugs' && <BugReportsTab />}
      {activeTab === 'suggestions' && <SuggestionsTab />}
    </TabScreenLayout>
  );
};

const FaqTab = () => {
  const { data: faqs, isLoading } = useGetFaqsQuery();
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </View>
    );
  }

  if (!faqs?.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="help-circle-outline" size={48} color={colors.gallery} />
        <Text style={styles.emptyTitle}>No FAQs available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {faqs.map((faq) => {
        const isOpen = expandedId === faq._id;
        return (
          <TouchableOpacity
            key={faq._id}
            style={styles.faqCard}
            onPress={() => setExpandedId(isOpen ? null : faq._id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.raven}
              />
            </View>
            {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
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
        <View style={styles.emptyState}>
          <Ionicons name="bug-outline" size={48} color={colors.gallery} />
          <Text style={styles.emptyTitle}>No bug reports yet</Text>
        </View>
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

const SuggestionsTab = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: profileData } = useGetProfileQuery();
  const [createSuggestion, { isLoading: isSubmitting }] = useCreateSuggestionMutation();
  const [deleteMySuggestion] = useDeleteMySuggestionMutation();
  const { data: mySuggestions } = useGetMySuggestionsQuery();
  const [toggleUpvote] = useToggleUpvoteMutation();

  const atLimit = mySuggestions?.length >= 10;

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory(null);
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
      await createSuggestion({
        title: title.trim(),
        description: description.trim(),
        category,
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Suggestion submitted!', text2: 'Thank you for your feedback.' });
      resetForm();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to submit suggestion' });
    }
  }, [title, description, category, createSuggestion, resetForm]);

  const handleUpvote = useCallback(async (id) => {
    try {
      await toggleUpvote(id).unwrap();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not update vote' });
    }
  }, [toggleUpvote]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteMySuggestion(deleteId).unwrap();
      Toast.show({ type: 'success', text1: 'Suggestion deleted' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete suggestion' });
    }
    setConfirmVisible(false);
    setDeleteId(null);
  }, [deleteId, deleteMySuggestion]);

  return (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb-outline" size={20} color={colors.mainOrange} />
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Share a Suggestion</Text>
          <Text style={styles.sectionSubtitle}>Got an idea to make Active Shape better? We'd love to hear it.</Text>
        </View>
      </View>

      {atLimit ? (
        <View style={styles.limitNotice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.buttercup} />
          <Text style={styles.limitText}>
            You've reached the maximum of 10 suggestions. We're already reviewing your ideas!
          </Text>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipWrap}>
            {SUGGESTION_CATEGORIES.map((cat) => (
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
            placeholder="Brief summary of your idea"
            placeholderTextColor={colors.raven}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your idea — what problem it solves and how it could work."
            placeholderTextColor={colors.raven}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={5000}
            textAlignVertical="top"
          />

          <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            icon="send-outline"
          />
        </View>
      )}

      {mySuggestions?.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>My Suggestions</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{mySuggestions.length}</Text>
            </View>
          </View>
          {mySuggestions.map((suggestion) => {
            const hasUpvoted = suggestion.upvotes?.includes(profileData?._id);
            return (
              <View key={suggestion._id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{suggestion.title}</Text>
                  <View style={styles.itemMeta}>
                    {suggestion.category && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {SUGGESTION_CATEGORIES.find((c) => c.value === suggestion.category)?.name ?? suggestion.category}
                        </Text>
                      </View>
                    )}
                    <View style={styles.statusTag}>
                      <View style={[styles.statusDot, { backgroundColor: SUGGESTION_DOT_COLORS[suggestion.status] || colors.raven }]} />
                      <Text style={styles.statusText}>
                        {SUGGESTION_STATUS_LABELS[suggestion.status] ?? suggestion.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.itemDesc} numberOfLines={3}>{suggestion.description}</Text>
                {suggestion.adminNote && (
                  <View style={styles.adminNote}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.havelockBlue} />
                    <Text style={styles.adminNoteText}>
                      <Text style={styles.adminNoteLabel}>Admin: </Text>
                      {suggestion.adminNote}
                    </Text>
                  </View>
                )}
                <View style={styles.itemFooter}>
                  <TouchableOpacity
                    style={[styles.upvoteBtn, hasUpvoted && styles.upvoteBtnActive]}
                    onPress={() => handleUpvote(suggestion._id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={hasUpvoted ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={16}
                      color={hasUpvoted ? colors.mainOrange : colors.raven}
                    />
                    <Text style={[styles.upvoteCount, hasUpvoted && styles.upvoteCountActive]}>
                      {suggestion.upvotes?.length ?? 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => { setDeleteId(suggestion._id); setConfirmVisible(true); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      {mySuggestions?.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color={colors.gallery} />
          <Text style={styles.emptyTitle}>No suggestions yet</Text>
        </View>
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Suggestion"
        message="This will permanently delete the suggestion."
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: `${colors.mainOrange}10`,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.mainOrange,
    fontWeight: '700',
  },
  tabContent: {
    gap: spacing.lg,
  },

  centered: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.raven,
  },

  faqCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.body,
    color: colors.mineShaft,
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.raven,
    marginTop: spacing.sm,
    lineHeight: 22,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gallery,
    paddingTop: spacing.sm,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  upvoteBtnActive: {
    backgroundColor: `${colors.mainOrange}14`,
  },
  upvoteCount: {
    ...typography.caption,
    color: colors.raven,
    fontWeight: '600',
  },
  upvoteCountActive: {
    color: colors.mainOrange,
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

export default HelpScreen;
