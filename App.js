import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { RootNavigator } from './src/navigation';
import { store } from './src/store';
import { useAuth } from './src/hooks/useAuth';
import { onUnauthorized } from './src/utils/authEvents';
import { colors } from './src/theme';

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { restoreSession, signOut } = useAuth();

  // Handle unauthorized events (401) - auto logout
  const handleUnauthorized = useCallback(async () => {
    if (__DEV__) {
      console.log('[Auth] Session expired or unauthorized - logging out');
    }
    
    await signOut();
  }, [signOut]);

  useEffect(() => {
    const subscription = onUnauthorized(handleUnauthorized);
    return () => subscription.remove();
  }, [handleUnauthorized]);

  useEffect(() => {
    const init = async () => {
      await restoreSession();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mainOrange} />
      </View>
    );
  }

  return <RootNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
