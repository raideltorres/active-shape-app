import { useCallback, useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';

import {
  useCreateSetupIntentMutation,
  useConfirmSetupIntentMutation,
} from '../store/api';

const RETURN_URL = 'activeshape://stripe-redirect';
const MERCHANT_DISPLAY_NAME = 'Active Shape';

/**
 * Encapsulates the full Stripe PaymentSheet flow for adding a payment method:
 * createSetupIntent -> initPaymentSheet -> presentPaymentSheet -> confirmSetupIntentApi
 *
 * Uses Stripe's native PaymentSheet (bottom sheet) which handles card entry,
 * 3DS/SCA authentication, Apple Pay, Google Pay, and card scanning.
 */
export const useStripePaymentSheet = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [createSetupIntent] = useCreateSetupIntentMutation();
  const [confirmSetupIntentApi] = useConfirmSetupIntentMutation();
  const [isProcessing, setIsProcessing] = useState(false);

  const addPaymentMethod = useCallback(async () => {
    setIsProcessing(true);

    try {
      const { clientSecret, customerId } = await createSetupIntent().unwrap();

      if (!clientSecret) {
        throw new Error('Failed to initialize payment setup.');
      }

      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: MERCHANT_DISPLAY_NAME,
        customerId,
        returnURL: RETURN_URL,
        style: 'automatic',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { canceled: true };
        }
        throw new Error(presentError.message);
      }

      const setupIntentId = clientSecret.split('_secret_')[0];
      await confirmSetupIntentApi(setupIntentId).unwrap();

      return { canceled: false };
    } finally {
      setIsProcessing(false);
    }
  }, [createSetupIntent, confirmSetupIntentApi, initPaymentSheet, presentPaymentSheet]);

  return { addPaymentMethod, isProcessing };
};
