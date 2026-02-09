/**
 * Returns current date as YYYY-MM-DD (for API and selectedDate state).
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} YYYY-MM-DD
 */
export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} YYYY-MM-DD
 */
export function subDays(dateStr, days) {
  return addDays(dateStr, -days);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format date for display: "Monday, January 25, 2025"
 */
export function formatLongDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekday = WEEKDAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Relative label: "Today", "Yesterday", "2 days ago", or ""
 */
export function getRelativeDayLabel(dateStr) {
  const today = getCurrentDate();
  if (dateStr === today) return 'Today';
  const yesterday = subDays(today, 1);
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  const t = new Date(today + 'T12:00:00');
  const diffDays = Math.round((t - d) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `${diffDays} days ago`;
  return '';
}

export function isSameDay(dateStrA, dateStrB) {
  return dateStrA === dateStrB;
}

export function isBefore(dateStrA, dateStrB) {
  return dateStrA < dateStrB;
}

export function isAfter(dateStrA, dateStrB) {
  return dateStrA > dateStrB;
}
