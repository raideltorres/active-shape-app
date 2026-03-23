import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import FormInput from '../../components/atoms/FormInput';
import GenderPicker from '../../components/organisms/GenderPicker';
import DateOfBirthPicker from '../../components/molecules/DateOfBirthPicker';
import ValuePicker from '../../components/molecules/ValuePicker/ValuePicker';
import BodyCompositionPicker from '../../components/molecules/BodyCompositionPicker/BodyCompositionPicker';
import {
  useGetProfileQuery,
  useUpsertUserMutation,
} from '../../store/api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  USER_DEFAULTS,
  fromCmToFeet,
  fromInchesToCm,
  fromKgToLbs,
  fromLbsToKg,
} from '../../utils/measure';

const EditProfileScreen = ({ navigation }) => {
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [upsertUser, { isLoading: isSaving }] = useUpsertUserMutation();

  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [birthDate, setBirthDate] = useState(
    profile?.birthDate ? new Date(profile.birthDate) : null,
  );
  const [height, setHeight] = useState(profile?.height || USER_DEFAULTS.height);
  const [weight, setWeight] = useState(profile?.weight || USER_DEFAULTS.weight);
  const [bodyComposition, setBodyComposition] = useState(
    profile?.bodyComposition || USER_DEFAULTS.bodyComposition,
  );

  const validate = useCallback(() => {
    if (!name.trim()) return 'Please enter your name';
    if (!gender) return 'Please select your gender';
    if (!birthDate) return 'Please select your date of birth';
    if (height < 50 || height > 300) return 'Please enter a valid height (50–300 cm)';
    if (weight < 20 || weight > 300) return 'Please enter a valid weight (20–300 kg)';
    return null;
  }, [name, gender, birthDate, height, weight]);

  const handleSave = useCallback(async () => {
    const error = validate();
    if (error) {
      Toast.show({ type: 'error', text1: 'Validation', text2: error });
      return;
    }

    try {
      await upsertUser({
        id: profile._id,
        name: name.trim(),
        gender,
        birthDate: birthDate.toISOString(),
        height,
        weight,
        bodyComposition,
      }).unwrap();

      Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your changes have been saved.' });
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.data?.message || 'Please try again.',
      });
    }
  }, [profile, name, gender, birthDate, height, weight, bodyComposition, upsertUser, validate, navigation]);

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.mainBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.mineShaft} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="checkmark" size={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              <FormInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                icon="person-outline"
                autoCorrect={false}
              />
              <GenderPicker value={gender} onChange={setGender} />
              <DateOfBirthPicker
                label="Date of Birth"
                value={birthDate}
                onChange={setBirthDate}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <View style={styles.card}>
              <ValuePicker
                title="Height"
                value={height}
                onChange={(v) => setHeight(parseFloat(v))}
                min={50}
                max={300}
                step={1}
                unit="cm"
                alternativeUnit="in"
                convertToAlternative={(cm) => fromCmToFeet(cm).totalInches}
                convertFromAlternative={fromInchesToCm}
                formatMainValue={(n) => String(Math.round(n))}
                formatAlternativeValue={(n) => String(Math.round(n))}
              />
              <ValuePicker
                title="Weight"
                value={weight}
                onChange={(v) => setWeight(parseFloat(v))}
                min={20}
                max={200}
                step={0.1}
                unit="kg"
                alternativeUnit="lbs"
                convertToAlternative={(kg) => fromKgToLbs(kg).lbs}
                convertFromAlternative={fromLbsToKg}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Composition</Text>
            <View style={styles.card}>
              <BodyCompositionPicker
                label="Body Type"
                question="Select the option that best describes your current physique."
                value={bodyComposition}
                onChange={setBodyComposition}
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.alabaster,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.mainBlue,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.mineShaft,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.raven,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default EditProfileScreen;
