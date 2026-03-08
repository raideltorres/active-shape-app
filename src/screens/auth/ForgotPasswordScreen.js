import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

import { ScrollableFormLayout } from '../../components/templates';
import { Button, BackButton, FormInput } from '../../components/atoms';
import { useForgotPasswordMutation } from '../../store/api';
import { authStyles as styles } from '../../theme/authStyles';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your email address.' });
      return;
    }

    try {
      await forgotPassword(email).unwrap();
      setSubmitted(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.data?.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <ScrollableFormLayout>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          {submitted
            ? 'Check your inbox for a reset link. It may take a few minutes to arrive.'
            : "Enter your email and we'll send you a link to reset your password."}
        </Text>
      </View>

      {!submitted && (
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

          <Button
            title={isLoading ? 'Sending...' : 'Send Reset Link'}
            onPress={handleSubmit}
            disabled={isLoading}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollableFormLayout>
  );
};

export default ForgotPasswordScreen;
