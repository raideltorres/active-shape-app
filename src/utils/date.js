/**
 * Returns current LOCAL date as YYYY-MM-DD.
 * NEVER use toISOString() for this — it produces UTC which shifts the date
 * for users in negative-offset timezones.
 */
export function getCurrentDate() {
  return toLocalDateString(new Date());
}

function toLocalDateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} YYYY-MM-DD
 */
export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toLocalDateString(d);
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
