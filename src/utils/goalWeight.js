import { getBmiAdjustment } from './bmi';

const PRIMARY_GOALS = {
  GAIN_MUSCLE: { code: 'pg1', weightMultiplier: 1.05 },
  MAINTAIN_WEIGHT: { code: 'pg2', weightMultiplier: 1.0 },
  LOSE_WEIGHT: { code: 'pg3', weightMultiplier: null },
  IMPROVE_PERFORMANCE: { code: 'pg4', weightMultiplier: 1.0 },
  GENERAL_HEALTH: { code: 'pg5', weightMultiplier: 1.0 },
};

const getPrimaryGoalByCode = (code) =>
  Object.values(PRIMARY_GOALS).find((g) => g.code === code) || null;

/**
 * Calculate a realistic goal weight based on current metrics,
 * body composition, and primary goal. Ported from the web app.
 */
export const calculateGoalWeight = ({
  weight,
  height,
  bodyComposition = 'average',
  primaryGoalCode,
}) => {
  const goal = getPrimaryGoalByCode(primaryGoalCode);

  if (goal?.weightMultiplier !== null) {
    return Math.round(weight * goal.weightMultiplier);
  }

  const heightM = height / 100;
  const rawBmi = weight / (heightM * heightM);
  const bmiAdj = getBmiAdjustment(bodyComposition);
  const adjustedBmi = rawBmi + bmiAdj;

  if (adjustedBmi >= 30) {
    return Math.round(weight * 0.9);
  } else if (adjustedBmi >= 25) {
    const targetRawBmi = 24.9 - bmiAdj;
    const targetWeight = Math.round(targetRawBmi * heightM * heightM);
    return Math.max(targetWeight, Math.round(weight * 0.95));
  }
  return Math.round(weight * 0.97);
};
