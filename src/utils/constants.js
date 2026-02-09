/**
 * Application constants and utility functions
 */

// User roles
export const USER_ROLES = {
  admin: 'admin',
  user: 'user',
  invited: 'invited',
};

/**
 * Check if user has admin role
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isAdmin = (role) => role === USER_ROLES.admin;

/**
 * Check if user bypasses plan restrictions (admin or invited)
 * @param {string} role - User role
 * @returns {boolean}
 */
export const bypassesPlanRestrictions = (role) => {
  return role === USER_ROLES.admin || role === USER_ROLES.invited;
};
