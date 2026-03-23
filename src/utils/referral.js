import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const REFERRAL_CODE_KEY = 'as_referral_code';

export const storeReferralCode = async (code) => {
  if (!code) return;
  await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
};

export const getStoredReferralCode = () => AsyncStorage.getItem(REFERRAL_CODE_KEY);

export const clearStoredReferralCode = () => AsyncStorage.removeItem(REFERRAL_CODE_KEY);

const extractRefCode = (url) => {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    return parsed.queryParams?.ref || null;
  } catch {
    return null;
  }
};

export const captureReferralFromURL = async (url) => {
  const code = extractRefCode(url);
  if (code) await storeReferralCode(code);
  return code;
};
