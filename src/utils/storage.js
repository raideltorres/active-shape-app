import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = new Set(['token', 'refreshToken']);

export const storage = {
  getItem: async (key) => {
    try {
      if (SECURE_KEYS.has(key)) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (SECURE_KEYS.has(key)) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      // Handle error
    }
  },

  removeItem: async (key) => {
    try {
      if (SECURE_KEYS.has(key)) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // Handle error
    }
  },

  clear: async () => {
    try {
      for (const key of SECURE_KEYS) {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.clear();
    } catch {
      // Handle error
    }
  },
};

