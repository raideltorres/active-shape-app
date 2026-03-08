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
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
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
  DAILY_INSIGHTS: '/users/generate-daily-insights',

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
  TRACKING_FIELD: '/trackings/field',

  // Meal Logs
  MEAL_LOGS: '/meal-logs',
  MEAL_LOGS_RECIPE: '/meal-logs/recipe',
  MEAL_LOGS_DAILY: '/meal-logs/daily',

  // AI Nutrition
  AI_NUTRITION_ANALYZE: '/ai-nutrition/analyze-food-image',
  AI_EXERCISE_ANALYZE: '/ai-nutrition/analyze-exercise',

  // Fasting
  FASTING_PLANS: '/fasting-plans',
  FASTING_SESSIONS: '/fasting-sessions',

  // Workouts
  WORKOUTS: '/workouts',
  WORKOUTS_CONFIGURATION: '/workouts/configuration',
  USER_WORKOUTS: '/user-workouts',
  USER_WORKOUTS_FAVORITE: '/user-workouts-favorite',

  // Constants
  CONSTANTS_ALL: '/constants/all',

  // Pricing Plans
  PRICING_PLANS: '/pricing-plans',

  // Stripe
  STRIPE_SETUP_CREATE_INTENT: '/stripe/setup/create-intent',
  STRIPE_SETUP_CONFIRM: '/stripe/setup/confirm',
  STRIPE_PAYMENT_METHODS: '/stripe/payment-methods',
  STRIPE_PAYMENT_METHODS_DEFAULT: '/stripe/payment-methods/default',
  STRIPE_SUBSCRIPTIONS: '/stripe/subscriptions',
  STRIPE_SUBSCRIPTIONS_CURRENT: '/stripe/subscriptions/current',
  STRIPE_INVOICES: '/stripe/invoices',
};
