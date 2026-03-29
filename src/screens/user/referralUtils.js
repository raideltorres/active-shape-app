import { colors } from '../../theme';

export const formatCents = (cents) => `$${(cents / 100).toFixed(2)}`;

export const STATUS_COLORS = {
  active: colors.lima,
  qualified: colors.havelockBlue,
  pending: colors.buttercup,
  paused: colors.raven,
  expired: colors.error,
  completed: colors.lima,
  processing: colors.havelockBlue,
  failed: colors.error,
};
