const BODY_COMPOSITION_TYPES = {
  ATHLETIC_MUSCULAR: { value: 'athletic_muscular', bmiAdjustment: -3 },
  FIT_TONED: { value: 'fit_toned', bmiAdjustment: -1.5 },
  AVERAGE: { value: 'average', bmiAdjustment: 0 },
  SLIM_LOW_MUSCLE: { value: 'slim_low_muscle', bmiAdjustment: 0.5 },
};

export const calculateBmi = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

export const getBmiCategory = (bmi) => {
  if (bmi <= 0) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const getBmiAdjustment = (bodyComposition) => {
  const match = Object.values(BODY_COMPOSITION_TYPES).find(
    (c) => c.value === bodyComposition,
  );
  return match?.bmiAdjustment || 0;
};
