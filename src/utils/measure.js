export const fromCmToFeet = (cm) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches, totalInches };
};

export const fromInchesToCm = (inches) => inches * 2.54;

export const fromKgToLbs = (kg) => {
  const lbs = Math.round(kg * 2.20462);
  return { kg, lbs };
};

export const fromLbsToKg = (lbs) => lbs / 2.20462;

export const calculateBmi = (weight, height) => {
  if (!weight || !height) return 0;
  return weight / Math.pow(height / 100, 2);
};

export const determineBmiRange = (bmi) => {
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  if (bmi >= 30 && bmi < 35) return 'Obesity Type 1';
  if (bmi >= 35 && bmi < 40) return 'Obesity Type 2';
  if (bmi >= 40) return 'Obesity Type 3';
  return 'Underweight';
};

export const BODY_COMPOSITION_TYPES = {
  ATHLETIC_MUSCULAR: {
    value: 'athletic_muscular',
    label: 'Athletic/Very Muscular',
    description: 'High muscle mass (athletes, bodybuilders, swimmers)',
    bmiAdjustment: -3,
  },
  FIT_TONED: {
    value: 'fit_toned',
    label: 'Fit & Toned',
    description: 'Good muscle mass and definition',
    bmiAdjustment: -1.5,
  },
  AVERAGE: {
    value: 'average',
    label: 'Average Build',
    description: 'Moderate muscle mass, typical build',
    bmiAdjustment: 0,
  },
  SLIM_LOW_MUSCLE: {
    value: 'slim_low_muscle',
    label: 'Slim with Low Muscle',
    description: 'Low muscle mass, naturally slim',
    bmiAdjustment: 0.5,
  },
  SOFT_HIGHER_FAT: {
    value: 'soft_higher_fat',
    label: 'Soft/Higher Body Fat',
    description: 'Very low muscle mass',
    bmiAdjustment: 1,
  },
};

export const getBmiAdjustment = (bodyComposition) => {
  const comp = Object.values(BODY_COMPOSITION_TYPES).find((c) => c.value === bodyComposition);
  return comp?.bmiAdjustment || 0;
};

export const adjustBmiForBodyComposition = (bmi, bodyComposition = 'average') => {
  return bmi + getBmiAdjustment(bodyComposition);
};

export const determineBmiMotivationalMessage = (bmi) => {
  const MOTIVATIONAL_MESSAGES = {
    UNDERWEIGHT: `Building a stronger you starts with proper nutrition! Your personalized plan includes nutrient-rich meals designed to help you gain healthy weight and build muscle. Every meal brings you closer to your goals.`,
    NORMAL: `Fantastic work maintaining a healthy weight! You're in the optimal range for overall health and wellness. Keep up your balanced lifestyle, and use our tools to stay on track and feel your best every day.`,
    OVERWEIGHT: `You're on the right path! Small, consistent changes lead to lasting results. Your personalized plan is designed to help you reach your goals at a healthy pace. Every step forward counts!`,
    OBESITY_TYPE_1: `Every journey starts with a single step, and you've already taken it! Your commitment to tracking and improving your health is admirable. We're here to support you with customized plans tailored to your needs.`,
    OBESITY_TYPE_2: `Progress happens one day at a time. You have the tools and support to make meaningful changes. Focus on today's goals, celebrate small wins, and trust the process. You've got this!`,
    OBESITY_TYPE_3: `Your health journey is a marathon, not a sprint. With dedication and the right support, significant improvements are possible. We're with you every step of the way, providing guidance tailored to your unique needs.`,
  };

  if (bmi >= 18.5 && bmi < 25) return MOTIVATIONAL_MESSAGES.NORMAL;
  if (bmi >= 25 && bmi < 30) return MOTIVATIONAL_MESSAGES.OVERWEIGHT;
  if (bmi >= 30 && bmi < 35) return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_1;
  if (bmi >= 35 && bmi < 40) return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_2;
  if (bmi >= 40) return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_3;
  return MOTIVATIONAL_MESSAGES.UNDERWEIGHT;
};

export const PRIMARY_GOALS = {
  GAIN_MUSCLE: { code: 'pg1', label: 'Gain Muscle', weightMultiplier: 1.05 },
  MAINTAIN_WEIGHT: { code: 'pg2', label: 'Maintain Weight', weightMultiplier: 1.0 },
  LOSE_WEIGHT: { code: 'pg3', label: 'Lose Weight', weightMultiplier: null },
  IMPROVE_PERFORMANCE: { code: 'pg4', label: 'Improve Athletic Performance', weightMultiplier: 1.0 },
  GENERAL_HEALTH: { code: 'pg5', label: 'General Health', weightMultiplier: 1.0 },
};

export const getPrimaryGoalByCode = (code) =>
  Object.values(PRIMARY_GOALS).find((g) => g.code === code) || null;

export const calculateGoalWeight = ({ weight, height, bodyComposition = 'average', primaryGoalCode }) => {
  const goal = getPrimaryGoalByCode(primaryGoalCode);
  if (goal?.weightMultiplier !== null) {
    return Math.round(weight * goal.weightMultiplier);
  }

  const heightM = height / 100;
  const rawBmi = weight / (heightM * heightM);
  const bmiAdj = getBmiAdjustment(bodyComposition);
  const adjustedBmi = rawBmi + bmiAdj;

  if (adjustedBmi >= 30) return Math.round(weight * 0.9);
  if (adjustedBmi >= 25) {
    const targetRawBmi = 24.9 - bmiAdj;
    const targetWeight = Math.round(targetRawBmi * heightM * heightM);
    return Math.max(targetWeight, Math.round(weight * 0.95));
  }
  return Math.round(weight * 0.97);
};

export const DIET_OPTIONS = [
  { value: 'none', label: 'No Specific Diet' },
  { value: 'keto', label: 'Keto' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'pescetarian', label: 'Pescatarian' },
  { value: 'gluten free', label: 'Gluten-Free' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'whole30', label: 'Whole30' },
  { value: 'primal', label: 'Primal' },
];

export const MEDICATION_OPTIONS = [
  { value: 'blood_pressure', text: 'Blood Pressure' },
  { value: 'diabetes_insulin', text: 'Diabetes / Insulin' },
  { value: 'thyroid', text: 'Thyroid' },
  { value: 'cholesterol_statins', text: 'Cholesterol / Statins' },
  { value: 'anti_inflammatory', text: 'Anti-Inflammatory' },
  { value: 'antidepressants', text: 'Antidepressants' },
  { value: 'blood_thinners', text: 'Blood Thinners' },
  { value: 'corticosteroids', text: 'Corticosteroids' },
];

export const INJURY_OPTIONS = [
  { value: 'back_spinal', text: 'Back / Spinal' },
  { value: 'knee', text: 'Knee' },
  { value: 'shoulder', text: 'Shoulder' },
  { value: 'hip_joint', text: 'Hip / Joint' },
  { value: 'ankle_foot', text: 'Ankle / Foot' },
  { value: 'wrist_hand', text: 'Wrist / Hand' },
  { value: 'neck', text: 'Neck' },
  { value: 'chronic_pain', text: 'Chronic Pain' },
];

export const USER_DEFAULTS = {
  height: 170,
  weight: 70,
  bodyComposition: 'average',
};

export const TIMELINE_RANGES = [
  { value: '1-3m', label: '1 – 3 months', midWeeks: 8.7 },
  { value: '3-6m', label: '3 – 6 months', midWeeks: 19.5 },
  { value: '6-12m', label: '6 – 12 months', midWeeks: 39 },
  { value: '12+m', label: '12+ months', midWeeks: 65 },
];
