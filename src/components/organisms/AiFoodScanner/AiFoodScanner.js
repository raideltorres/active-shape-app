import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { analyzeFoodImage } from '../../../services/api';
import { Card } from '../../molecules';
import { Button } from '../../atoms';
import { colors, spacing, typography } from '../../../theme';
import FoodAnalysisResultCard from './FoodAnalysisResultCard';

const AiFoodScanner = ({ userId, onFoodAnalyzed }) => {
  const [dishContext, setDishContext] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [logging, setLogging] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera access',
        'Please allow camera access in Settings to take a photo of your meal.',
        [{ text: 'OK' }],
      );
      return false;
    }
    return true;
  }, []);

  const requestMediaLibraryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo library',
        'Please allow photo library access to choose a food image.',
        [{ text: 'OK' }],
      );
      return false;
    }
    return true;
  }, []);

  const takePhoto = useCallback(async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setError(null);
        setAnalysisResponse(null);
      }
    } catch (e) {
      if (__DEV__) console.error('Camera error:', e);
      setError('Failed to open camera.');
    }
  }, [requestCameraPermission]);

  const chooseFromGallery = useCallback(async () => {
    const ok = await requestMediaLibraryPermission();
    if (!ok) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setError(null);
        setAnalysisResponse(null);
      }
    } catch (e) {
      if (__DEV__) console.error('Image picker error:', e);
      setError('Failed to open photo library.');
    }
  }, [requestMediaLibraryPermission]);

  const analyzeImage = useCallback(async () => {
    if (!imageUri || !userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeFoodImage(userId, imageUri, dishContext.trim());
      setAnalysisResponse(data);
    } catch (e) {
      if (__DEV__) console.error('Analyze food error:', e);
      setError(e?.message || 'Analysis failed. Please try again with a clearer image.');
    } finally {
      setIsLoading(false);
    }
  }, [imageUri, userId, dishContext]);

  const handleLogToTracking = useCallback(async () => {
    if (!analysisResponse?.analysis || !onFoodAnalyzed) return;
    setLogging(true);
    try {
      await onFoodAnalyzed(analysisResponse.analysis);
      setAnalysisResponse(null);
      setImageUri(null);
      setDishContext('');
    } catch (e) {
      if (__DEV__) console.error('Log food error:', e);
      Alert.alert('Error', e?.message || 'Failed to log food.');
    } finally {
      setLogging(false);
    }
  }, [analysisResponse, onFoodAnalyzed]);

  const handleAnalyzeAnother = useCallback(() => {
    setAnalysisResponse(null);
    setImageUri(null);
    setError(null);
  }, []);

  // Result state: show result card and actions
  if (analysisResponse?.analysis && !isLoading) {
    return (
      <FoodAnalysisResultCard
        analysis={analysisResponse.analysis}
        onLogToTracking={handleLogToTracking}
        onAnalyzeAnother={handleAnalyzeAnother}
        logging={logging}
      />
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={22} color={colors.mainBlue} />
        <Text style={styles.title}>AI Food Scanner</Text>
      </View>
      <Text style={styles.description}>
        Snap a photo of your meal and our AI will analyze the nutritional content. For complex dishes, add the dish name
        or key ingredients below.
      </Text>

      <Text style={styles.inputLabel}>Dish name or ingredients (optional)</Text>
      <TextInput
        style={styles.input}
        value={dishContext}
        onChangeText={setDishContext}
        placeholder="e.g. Greek salad with feta"
        placeholderTextColor={colors.alto}
      />

      {!imageUri ? (
        <View style={styles.uploadArea}>
          <TouchableOpacity style={styles.uploadOption} onPress={takePhoto} disabled={isLoading}>
            <Ionicons name="camera" size={40} color={colors.mainOrange} />
            <Text style={styles.uploadLabel}>Take a picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={chooseFromGallery} disabled={isLoading}>
            <Ionicons name="images" size={40} color={colors.mainOrange} />
            <Text style={styles.uploadLabel}>Choose from gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewActions}>
            <Button title="Analyze" onPress={analyzeImage} disabled={isLoading} style={styles.analyzeBtn} />
            <Button
              title="Replace"
              onPress={() => { setImageUri(null); setError(null); }}
              variant="secondary"
              style={styles.replaceBtn}
            />
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.mainOrange} />
          <Text style={styles.loadingText}>Analyzing your food...</Text>
          <Text style={styles.loadingSubtext}>Identifying foods and calculating nutrition.</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.mainBlue,
    marginLeft: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.raven,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gallery,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    marginBottom: spacing.lg,
  },
  uploadArea: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.athensGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gallery,
  },
  uploadLabel: {
    ...typography.body,
    color: colors.mineShaft,
    marginTop: spacing.sm,
  },
  previewWrap: {
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.gallery,
  },
  previewActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  analyzeBtn: { flex: 1 },
  replaceBtn: {},
  loading: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.mineShaft,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: colors.raven,
    marginTop: 4,
  },
  errorWrap: {
    backgroundColor: `${colors.error}12`,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
  },
});

export default AiFoodScanner;
