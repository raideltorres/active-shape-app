import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { useAuth } from './useAuth';
import { useGoogleSignInMutation, useGoogleSignUpMutation } from '../store/api';
import { API_BASE_URL } from '../services/api/config';
import { GOOGLE_CONFIG } from '../constants/oauth';

// Required for web browser auth sessions
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook for handling social authentication (Google, Facebook, Twitter)
 * @param {string} mode - 'signIn' or 'signUp' - determines which API endpoint to call
 */
export const useSocialAuth = (mode = 'signIn') => {
  const [socialLoading, setSocialLoading] = useState(null);
  const { login } = useAuth();
  const [googleSignIn] = useGoogleSignInMutation();
  const [googleSignUp] = useGoogleSignUpMutation();

  // Google Auth Hook
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  const handleGoogleSuccess = useCallback(async (idToken) => {
    try {
      if (!idToken) {
        throw new Error('No ID token received');
      }
      const mutation = mode === 'signUp' ? googleSignUp : googleSignIn;
      const response = await mutation(idToken).unwrap();
      await login(response.data, response.access_token);
    } catch (error) {
      const action = mode === 'signUp' ? 'sign up' : 'sign in';
      Alert.alert('Error', error.data?.message || error.message || `Google ${action} failed`);
    } finally {
      setSocialLoading(null);
    }
  }, [login, mode, googleSignIn, googleSignUp]);

  // Watch for Google auth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      handleGoogleSuccess(id_token);
    } else if (googleResponse?.type === 'error') {
      setSocialLoading(null);
      const action = mode === 'signUp' ? 'sign up' : 'sign in';
      Alert.alert('Error', googleResponse.error?.message || `Google ${action} failed. Please try again.`);
    } else if (googleResponse?.type === 'dismiss') {
      setSocialLoading(null);
    }
  }, [googleResponse, handleGoogleSuccess, mode]);

  // Handle browser-based OAuth callback
  const handleBrowserAuthResult = useCallback(async (result, providerName) => {
    if (result.type === 'success' && result.url) {
      try {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const success = url.searchParams.get('success');

        if (success === 'true' && token) {
          await login(null, token);
        } else {
          const error = url.searchParams.get('error');
          Alert.alert('Error', error || `${providerName} authentication failed`);
        }
      } catch (error) {
        Alert.alert('Error', `${providerName} authentication failed`);
      }
    }
    setSocialLoading(null);
  }, [login]);

  // Main handler for all social providers
  const handleSocialAuth = useCallback(async (provider) => {
    setSocialLoading(provider);

    try {
      switch (provider) {
        case 'google':
          if (googleRequest) {
            await googlePromptAsync();
          } else {
            Alert.alert(
              'Configuration Required',
              'Google authentication is not configured yet.'
            );
            setSocialLoading(null);
          }
          break;

        case 'facebook': {
          const fbRedirectUri = makeRedirectUri({ scheme: 'activeshape', path: 'auth/facebook' });
          const fbResult = await WebBrowser.openAuthSessionAsync(
            `${API_BASE_URL}/auth/facebook?redirect=${encodeURIComponent(fbRedirectUri)}`,
            fbRedirectUri
          );
          await handleBrowserAuthResult(fbResult, 'Facebook');
          break;
        }

        case 'twitter': {
          const twitterRedirectUri = makeRedirectUri({ scheme: 'activeshape', path: 'auth/twitter' });
          const twitterResult = await WebBrowser.openAuthSessionAsync(
            `${API_BASE_URL}/auth/twitter?redirect=${encodeURIComponent(twitterRedirectUri)}`,
            twitterRedirectUri
          );
          await handleBrowserAuthResult(twitterResult, 'X');
          break;
        }

        default:
          setSocialLoading(null);
      }
    } catch (error) {
      console.error('Social auth error:', error);
      Alert.alert('Error', 'Social authentication failed. Please try again.');
      setSocialLoading(null);
    }
  }, [googleRequest, googlePromptAsync, handleBrowserAuthResult]);

  return {
    socialLoading,
    handleSocialAuth,
    isGoogleReady: !!googleRequest,
  };
};
