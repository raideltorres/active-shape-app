/**
 * Weight conversion and formatting utilities.
 * Matches web (active-shape) behavior: kg with 1 decimal, lbs as integer.
 */

const KG_TO_LBS = 2.20462;

/**
 * Convert kg to lbs. Returns object with kg and lbs (lbs rounded to integer, matching web).
 * @param {number} kg
 * @returns {{ kg: number, lbs: number }}
 */
export const fromKgToLbs = (kg) => {
  const lbs = Math.round(kg * KG_TO_LBS);
  return { kg, lbs };
};

/**
 * Convert lbs to kg.
 * @param {number} lbs
 * @returns {number}
 */
export const fromLbsToKg = (lbs) => lbs / KG_TO_LBS;

/** Decimal places for kg display (step 0.1 → 1 decimal). */
const KG_DECIMALS = 1;

/**
 * Format kg for display (avoids floating-point noise like 89.6000000001).
 * @param {number} kg
 * @returns {string}
 */
export const formatWeightKg = (kg) => {
  const n = Number(kg);
  if (Number.isNaN(n)) return '';
  const rounded = Math.round(n * Math.pow(10, KG_DECIMALS)) / Math.pow(10, KG_DECIMALS);
  return rounded.toFixed(KG_DECIMALS);
};

/**
 * Format lbs for display. Web shows integer lbs.
 * @param {number} lbs
 * @returns {string}
 */
export const formatWeightLbs = (lbs) => {
  const n = Number(lbs);
  if (Number.isNaN(n)) return '';
  return String(Math.round(n));
};
