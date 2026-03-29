export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
};

/**
 * Validates a password against standard rules.
 * @param {string} password
 * @returns {string|null} First error message, or null if valid.
 */
export const validatePassword = (password) => {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return 'Password must be at least 8 characters long';
  }
  if (!PASSWORD_RULES.hasUppercase.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!PASSWORD_RULES.hasNumber.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!PASSWORD_RULES.hasSpecial.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};
