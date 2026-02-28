export const fromCmToFeet = (cm) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches, totalInches };
};

export const fromInchesToCm = (inches) => {
  return inches * 2.54;
};

export const fromKgToLbs = (kg) => {
  const lbs = Math.round(kg * 2.20462);
  return { kg, lbs };
};

export const fromLbsToKg = (lbs) => {
  return lbs / 2.20462;
};

// Mobile-only: used by WeightTrackerSection and TrackingScreen
export const formatWeightKg = (kg) => String(parseFloat(Number(kg).toFixed(1)));
export const formatWeightLbs = (lbs) => String(Math.round(Number(lbs)));

export const determineBmiRange = (bmi) => {
  const BMI_RANGES = {
    UNDERWEIGHT: 'Underweight',
    NORMAL: 'Normal',
    OVERWEIGHT: 'Overweight',
    OBESITY_TYPE_1: 'Obesity Type 1',
    OBESITY_TYPE_2: 'Obesity Type 2',
    OBESITY_TYPE_3: 'Obesity Type 3',
  };

  if (bmi >= 18.5 && bmi < 25) {
    return BMI_RANGES.NORMAL;
  } else if (bmi >= 25 && bmi < 30) {
    return BMI_RANGES.OVERWEIGHT;
  } else if (bmi >= 30 && bmi < 35) {
    return BMI_RANGES.OBESITY_TYPE_1;
  } else if (bmi >= 35 && bmi < 40) {
    return BMI_RANGES.OBESITY_TYPE_2;
  } else if (bmi >= 40) {
    return BMI_RANGES.OBESITY_TYPE_3;
  } else {
    return BMI_RANGES.UNDERWEIGHT;
  }
};

export const determineBmiDescription = (bmi) => {
  const BMI_RANGES = {
    UNDERWEIGHT: `Being underweight, with a BMI below 18.5, can lead to a weakened immune system, fragile bones, and 
            nutrient deficiencies, making it harder for your body to fight infections and recover from illness. 
            Compared to the normal weight range, underweight individuals might struggle with energy levels and 
            overall health. Our platform offers customized dietary plans and workout routines to help you gain
             weight healthily, ensuring you receive the necessary nutrients to build muscle, improve your 
             immune function, and enhance overall well-being.`,
    NORMAL: `A normal BMI, ranging from 18.5 to 24.9, indicates a healthy weight. Maintaining this balance reduces the 
            risk of chronic diseases like heart disease and diabetes, enhancing overall well-being and longevity. 
            Compared to being underweight, normal weight individuals typically have better energy levels and 
            immune function. Unlike those who are overweight or obese, they have a lower risk of developing 
            weight-related health issues. Our diverse range of diets, workouts, and tracking tools will help 
            you sustain this healthy weight, optimize your fitness level, and improve your quality of life.`,
    OVERWEIGHT: `Being overweight, with a BMI between 25 and 29.9, means your weight is higher than the normal range but 
            not yet in the obesity category. This can increase the risk of heart disease, diabetes, and other 
            health issues compared to those with a normal BMI. Overweight individuals may experience more strain 
            on joints and potential metabolic issues than those in the normal weight range but are not as 
            severely impacted as those in the obesity categories. Our personalized diet plans, exercise routines, 
            and progress tracking can assist you in losing weight safely and effectively, reducing these health 
            risks and improving your overall fitness.`,
    OBESITY_TYPE_1: `Obesity Type 1, with a BMI between 30 and 34.9, indicates moderate obesity. This category heightens 
            the risk of cardiovascular diseases, diabetes, and joint problems compared to being overweight or having 
            a normal BMI. Individuals in this category face more significant health challenges than those in the 
            overweight category but are at a lower risk than those in the more severe obesity categories. Our 
            comprehensive approach, combining diet plans, workout regimens, and continuous monitoring, helps you 
            lose weight and mitigate these health risks, improving your quality of life.`,
    OBESITY_TYPE_2: `Obesity Type 2, characterized by a BMI between 35 and 39.9, signifies severe obesity. This significantly 
            increases the risk of serious health problems like heart disease, stroke, and certain cancers compared 
            to those in the Obesity Type 1 and overweight categories. The health risks and challenges are more pronounced, 
            necessitating a more intensive approach to weight loss and health improvement. We provide intensive support, 
            including customized diets, exercise plans, and regular health tracking, to aid in significant weight loss and 
            enhance overall health.`,
    OBESITY_TYPE_3: `Obesity Type 3, or morbid obesity, represents the highest BMI category, with severe health risks including
            heart disease, diabetes, and reduced life expectancy. Our platform offers specialized, medically-informed
            diet and exercise plans, along with professional guidance, to support substantial weight loss and enhance
            overall health.`,
  };

  if (bmi >= 18.5 && bmi < 25) {
    return BMI_RANGES.NORMAL;
  } else if (bmi >= 25 && bmi < 30) {
    return BMI_RANGES.OVERWEIGHT;
  } else if (bmi >= 30 && bmi < 35) {
    return BMI_RANGES.OBESITY_TYPE_1;
  } else if (bmi >= 35 && bmi < 40) {
    return BMI_RANGES.OBESITY_TYPE_2;
  } else if (bmi >= 40) {
    return BMI_RANGES.OBESITY_TYPE_3;
  } else {
    return BMI_RANGES.UNDERWEIGHT;
  }
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

  if (bmi >= 18.5 && bmi < 25) {
    return MOTIVATIONAL_MESSAGES.NORMAL;
  } else if (bmi >= 25 && bmi < 30) {
    return MOTIVATIONAL_MESSAGES.OVERWEIGHT;
  } else if (bmi >= 30 && bmi < 35) {
    return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_1;
  } else if (bmi >= 35 && bmi < 40) {
    return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_2;
  } else if (bmi >= 40) {
    return MOTIVATIONAL_MESSAGES.OBESITY_TYPE_3;
  } else {
    return MOTIVATIONAL_MESSAGES.UNDERWEIGHT;
  }
};

export const calculateBmi = (weight, height) => {
  return weight / Math.pow(height / 100, 2);
};

export const BODY_COMPOSITION_TYPES = {
  ATHLETIC_MUSCULAR: {
    value: 'athletic_muscular',
    label: 'Athletic/Very Muscular',
    description: 'High muscle mass (athletes, bodybuilders, swimmers)',
    bmiAdjustment: -3,
    muscleMass: 'high',
    bodyFat: 'low',
  },
  FIT_TONED: {
    value: 'fit_toned',
    label: 'Fit & Toned',
    description: 'Good muscle mass and definition',
    bmiAdjustment: -1.5,
    muscleMass: 'moderate-high',
    bodyFat: 'low-moderate',
  },
  AVERAGE: {
    value: 'average',
    label: 'Average Build',
    description: 'Moderate muscle mass, typical build',
    bmiAdjustment: 0,
    muscleMass: 'moderate',
    bodyFat: 'moderate',
  },
  SLIM_LOW_MUSCLE: {
    value: 'slim_low_muscle',
    label: 'Slim with Low Muscle',
    description: 'Low muscle mass, naturally slim',
    bmiAdjustment: 0.5,
    muscleMass: 'low',
    bodyFat: 'low-moderate',
  },
  SOFT_HIGHER_FAT: {
    value: 'soft_higher_fat',
    label: 'Soft/Higher Body Fat',
    description: 'Very low muscle mass',
    bmiAdjustment: 1,
    muscleMass: 'low',
    bodyFat: 'high',
  },
};

export const adjustBmiForBodyComposition = (bmi, bodyComposition = 'average') => {
  const composition = Object.values(BODY_COMPOSITION_TYPES).find((c) => c.value === bodyComposition);
  const adjustment = composition ? composition.bmiAdjustment : 0;
  return bmi + adjustment;
};

export const getHealthAssessment = (weight, height, bodyComposition = 'average') => {
  const rawBmi = calculateBmi(weight, height);
  const adjustedBmi = adjustBmiForBodyComposition(rawBmi, bodyComposition);
  const range = determineBmiRange(adjustedBmi);
  const description = determineBmiDescription(adjustedBmi);

  return {
    rawBmi: rawBmi.toFixed(1),
    adjustedBmi: adjustedBmi.toFixed(1),
    range,
    description,
    bodyComposition,
  };
};

export const PRIMARY_GOALS = {
  GAIN_MUSCLE: {
    code: 'pg1',
    label: 'Gain Muscle',
    weightMultiplier: 1.05,
  },
  MAINTAIN_WEIGHT: {
    code: 'pg2',
    label: 'Maintain Weight',
    weightMultiplier: 1.0,
  },
  LOSE_WEIGHT: {
    code: 'pg3',
    label: 'Lose Weight',
    weightMultiplier: null,
  },
  IMPROVE_PERFORMANCE: {
    code: 'pg4',
    label: 'Improve Athletic Performance',
    weightMultiplier: 1.0,
  },
  GENERAL_HEALTH: {
    code: 'pg5',
    label: 'General Health',
    weightMultiplier: 1.0,
  },
};

export const getPrimaryGoalByCode = (code) => {
  return Object.values(PRIMARY_GOALS).find((goal) => goal.code === code) || null;
};

export const getBmiAdjustment = (bodyComposition) => {
  const composition = Object.values(BODY_COMPOSITION_TYPES).find((c) => c.value === bodyComposition);
  return composition?.bmiAdjustment || 0;
};

export const calculateGoalWeight = ({ weight, height, bodyComposition = 'average', primaryGoalCode }) => {
  const goal = getPrimaryGoalByCode(primaryGoalCode);

  if (goal?.weightMultiplier !== null) {
    return Math.round(weight * goal.weightMultiplier);
  }

  const heightM = height / 100;
  const rawBmi = weight / (heightM * heightM);
  const bmiAdjustment = getBmiAdjustment(bodyComposition);
  const adjustedBmi = rawBmi + bmiAdjustment;

  if (adjustedBmi >= 35) {
    return Math.round(weight * 0.9);
  } else if (adjustedBmi >= 30) {
    return Math.round(weight * 0.9);
  } else if (adjustedBmi >= 25) {
    const targetAdjustedBmi = 24.9;
    const targetRawBmi = targetAdjustedBmi - bmiAdjustment;
    const targetWeight = Math.round(targetRawBmi * heightM * heightM);
    return Math.max(targetWeight, Math.round(weight * 0.95));
  } else {
    return Math.round(weight * 0.97);
  }
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
