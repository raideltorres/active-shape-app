import { DeviceEventEmitter } from 'react-native';

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  SESSION_EXPIRED: 'auth:session_expired',
};

/**
 * Emit an unauthorized event (called by API client on 401)
 */
export const emitUnauthorized = () => {
  DeviceEventEmitter.emit(AUTH_EVENTS.UNAUTHORIZED);
};

/**
 * Subscribe to unauthorized events
 * @param {Function} callback - Function to call when unauthorized event occurs
 * @returns {Object} subscription - Call .remove() to unsubscribe
 */
export const onUnauthorized = (callback) => {
  return DeviceEventEmitter.addListener(AUTH_EVENTS.UNAUTHORIZED, callback);
};
