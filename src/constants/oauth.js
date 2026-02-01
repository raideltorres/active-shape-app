// OAuth Configuration - loaded from environment variables
export const GOOGLE_CONFIG = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
};

// Social provider configuration for UI
export const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: 'logo-google',
    color: '#DB4437',
    bgColor: '#fff',
    textColor: '#333',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    bgColor: '#1877F2',
    textColor: '#fff',
  },
  {
    id: 'twitter',
    name: 'X',
    icon: 'logo-twitter',
    color: '#000',
    bgColor: '#000',
    textColor: '#fff',
  },
];
