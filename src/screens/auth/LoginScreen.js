import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

import { ScrollableFormLayout } from '../../components/templates';
import {
  Button,
  BackButton,
  Divider,
  FormInput,
  SocialButton,
} from '../../components/atoms';
import { useAuth, useSocialAuth } from '../../hooks';
import { useSignInMutation } from '../../store/api';
import { API_BASE_URL } from '../../services/api/config';
import { SOCIAL_PROVIDERS } from '../../constants/oauth';
import { authStyles as styles } from '../../theme/authStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { socialLoading, handleSocialAuth } = useSocialAuth('signIn');
  const [signIn, { isLoading }] = useSignInMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields.' });
      return;
    }

    try {
      const response = await signIn({ email, password }).unwrap();
      await login(response.data, response.access_token, response.refresh_token);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.data?.message || error.message || 'Please try again.' });
    }
  };

  // DEV ONLY: Quick login for testing
  const handleDevLogin = async () => {
    if (__DEV__) {
      console.log('[DEV] Attempting dev login to:', API_BASE_URL);
    }
    try {
      const response = await signIn({
        email: 'admin@gotowertech.com',
        password: 'Pac0peric0',
      }).unwrap();
      await login(response.data, response.access_token, response.refresh_token);
    } catch (error) {
      if (__DEV__) console.error('[DEV] Login error:', error);
      Toast.show({ type: 'error', text1: 'Dev Login Error', text2: error.data?.message || error.message });
    }
  };

  return (
    <ScrollableFormLayout>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your fitness journey
        </Text>
      </View>

      <View style={styles.socialSection}>
        {SOCIAL_PROVIDERS.map((provider) => (
          <SocialButton
            key={provider.id}
            provider={provider}
            onPress={handleSocialAuth}
            loading={socialLoading === provider.id}
          />
        ))}
      </View>

      <Divider text="or continue with email" />

      <View style={styles.form}>
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          icon="mail-outline"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
        />

        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          icon="lock-closed-outline"
          secureTextEntry
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoComplete="password"
          textContentType="password"
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? 'Signing in...' : 'Sign In'}
          onPress={handleLogin}
          disabled={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* DEV ONLY */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={handleDevLogin}
          disabled={isLoading}
        >
          <Text style={styles.devButtonText}>
            🔧 Dev Login (admin@gotowertech.com)
          </Text>
        </TouchableOpacity>
      )}
    </ScrollableFormLayout>
  );
};

export default LoginScreen;
