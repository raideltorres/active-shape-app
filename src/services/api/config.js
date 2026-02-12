// API Base URL from environment variable
// Set EXPO_PUBLIC_API_BASE_URL in your .env file
// Examples:
//   - Android emulator: http://10.0.2.2:5174
//   - iOS simulator: http://localhost:5174
//   - Physical device: http://YOUR_COMPUTER_IP:5174
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5174';

export const API_ENDPOINTS = {
  // Auth - Standard
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  PROFILE: '/users/profile',

  // Auth - Social
  GOOGLE_SIGN_IN: '/auth/google-sign-in',
  GOOGLE_SIGN_UP: '/auth/google-sign-up',
  FACEBOOK_SIGN_IN: '/auth/facebook-sign-in',
  FACEBOOK_SIGN_UP: '/auth/facebook-sign-up',
  TWITTER_AUTH: '/auth/twitter', // Redirects to Twitter OAuth

  // Legacy (for compatibility)
  LOGIN: '/auth/sign-in',
  REGISTER: '/auth/sign-up',

  // Users
  USERS: '/users',
  DAILY_INSIGHTS: '/users/daily-insights',

  // Recipes
  RECIPES: '/recipes',
  RECIPES_GET: '/recipes/get-recipes',
  RECIPE_DETAILS: (id) => `/recipes/${id}`,
  RECIPES_USER_FILTERS: '/recipes/user/filters',

  // Meal Logs
  MEAL_LOGS: '/meal-logs',
  LOG_MEAL: '/meal-logs/recipe',

  // Tracking
  TRACKING: '/trackings',
  DAILY_TRACKING: '/trackings/daily',

  // AI Nutrition
  AI_NUTRITION_ANALYZE: '/ai-nutrition/analyze-food-image',

  // Fasting
  FASTING_PLANS: '/fasting-plans',
  FASTING_SESSIONS: '/fasting-sessions',
};
