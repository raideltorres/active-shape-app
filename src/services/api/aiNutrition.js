import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * Analyze a food image with AI. Uses FormData: image file, userId, context.
 * @param {string} userId - User ID (profile._id)
 * @param {string} imageUri - Local file URI from camera or image picker (e.g. file:// or content://)
 * @param {string} [context] - Optional dish name or ingredients hint
 * @returns {Promise<{ analysis: object }>} API response with analysis (foods, totalNutrition, suggestions, mealType)
 */
export async function analyzeFoodImage(userId, imageUri, context = '') {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append(
    'image',
    typeof imageUri === 'string'
      ? { uri: imageUri, type: 'image/jpeg', name: 'image.jpg' }
      : imageUri,
  );
  const contextMessage = context
    ? `Dish name or ingredients: ${context}. Please analyze this image considering this information and identify all components.`
    : 'Analyze this food image and identify all visible ingredients and components.';
  formData.append('context', contextMessage);

  return apiClient.postFormData(API_ENDPOINTS.AI_NUTRITION_ANALYZE, formData);
}
