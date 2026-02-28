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
import { useSignUpMutation } from '../../store/api';
import { SOCIAL_PROVIDERS } from '../../constants/oauth';
import { authStyles as styles } from '../../theme/authStyles';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const { socialLoading, handleSocialAuth } = useSocialAuth('signUp');
  const [signUp, { isLoading }] = useSignUpMutation();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields.' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      const response = await signUp({ name, email, password }).unwrap();
      await login(response.data, response.access_token, response.refresh_token);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error.data?.message || error.message || 'Please try again.' });
    }
  };

  return (
    <ScrollableFormLayout>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your fitness journey today</Text>
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

      <Divider text="or register with email" />

      <View style={styles.formCompact}>
        <FormInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          icon="person-outline"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
        />

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          icon="mail-outline"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          icon="lock-closed-outline"
          secureTextEntry
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoComplete="password-new"
          textContentType="newPassword"
        />

        <FormInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          icon="lock-closed-outline"
          secureTextEntry
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          autoComplete="password-new"
          textContentType="newPassword"
        />

        <Text style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        <Button
          title={isLoading ? 'Creating account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollableFormLayout>
  );
};

export default RegisterScreen;
