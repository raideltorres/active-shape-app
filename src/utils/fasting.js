/**
 * Calculates the feeding window based on fasting duration.
 * For time-restricted eating (<24h): feeding window = 24 - fasting hours
 * For extended fasts (>=24h): defaults to 24h refeed period
 */
export const calculateFeedingWindow = (fastingHours, feedingWindow = null) => {
  if (feedingWindow != null) return feedingWindow;
  if (fastingHours >= 24) return 24;
  return 24 - fastingHours;
};

/**
 * Calculates the total fasting cycle duration (fasting + feeding).
 */
export const calculateTotalCycle = (fastingHours, feedingWindow = null) => {
  const actualFeedingWindow = calculateFeedingWindow(fastingHours, feedingWindow);
  return fastingHours + actualFeedingWindow;
};

/**
 * Formats a duration in hours to a human-readable string.
 * Shows days for durations >= 24h.
 */
export const formatFastingDuration = (hours) => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
};

/**
 * Determines if a fasting duration qualifies as an extended fast.
 */
export const isExtendedFast = (fastingHours) => fastingHours >= 24;

/**
 * Calculates fasting and feeding percentages for visualization.
 */
export const calculateFastingPercentages = (fastingHours, feedingWindow = null) => {
  const actualFeedingWindow = calculateFeedingWindow(fastingHours, feedingWindow);
  const totalHours = fastingHours + actualFeedingWindow;
  return {
    fastingPercent: (fastingHours / totalHours) * 100,
    feedingPercent: (actualFeedingWindow / totalHours) * 100,
  };
};

/**
 * Converts seconds to a formatted time string (HH:MM:SS).
 */
export const secondsToTime = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h}h ${m}m ${s}s`;
};

/**
 * Converts seconds to a shorter display (e.g., "16h 30m").
 */
export const secondsToShortTime = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Formats a date as a calendar-friendly string.
 */
export const formatCalendarDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Gets the start/end of a month for calendar queries.
 */
export const getMonthRange = (year, month) => {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
};
