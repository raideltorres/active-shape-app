import { colors } from '../theme';

export const FASTING_STAGES = [
  {
    value: 0,
    color: colors.salmon,
    label: 'Fed',
    icon: 'restaurant-outline',
    description: 'Digestion phase, nutrient absorption',
    longDescription:
      'During the fed stage, your body digests and absorbs nutrients from your last meal. Insulin levels are elevated to help cells take up glucose for energy. This phase typically lasts 3-4 hours after eating. Excess glucose is stored as glycogen in the liver and muscles, while any surplus is converted into fat for long-term storage.',
  },
  {
    value: 14400,
    color: colors.mainBlue,
    label: 'Early Fasting',
    icon: 'time-outline',
    description: 'Glycogen depletion, insulin drops',
    longDescription:
      'In the early fasting stage, digestion is complete and blood insulin levels begin to drop. Your body starts breaking down glycogen stored in the liver for energy. Fat breakdown increases slightly as the body transitions from using dietary glucose to relying on glycogen reserves.',
  },
  {
    value: 43200,
    color: colors.mainOrange,
    label: 'Fat Burning',
    icon: 'flame-outline',
    description: 'Lipolysis begins, fat mobilization',
    longDescription:
      'In the fat burning stage, glycogen stores become depleted, and your body initiates gluconeogenesis, converting amino acids and lactate into glucose. Your body also starts mobilizing fat stores for energy, increasing the release of free fatty acids into the bloodstream.',
  },
  {
    value: 64800,
    color: colors.fernFrond,
    label: 'Ketosis',
    icon: 'flash-outline',
    description: 'Ketone production, enhanced fat burning',
    longDescription:
      'Ketosis begins when the liver converts fatty acids into ketones, which serve as an alternative energy source. As blood glucose levels drop, ketone production increases, leading to greater fat oxidation. Your body enters a state of efficient fat burning.',
  },
  {
    value: 172800,
    color: colors.purple,
    label: 'Autophagy',
    icon: 'sparkles-outline',
    description: 'Cellular cleanup, tissue repair',
    longDescription:
      'During autophagy, your body reaches an optimal level of ketone production and triggers cellular self-cleaning. Damaged cells and proteins are recycled and repaired. This phase is associated with improved cellular health, reduced inflammation, and potential longevity benefits.',
  },
  {
    value: 259200,
    color: colors.redBerry,
    label: 'Extended Fast',
    icon: 'shield-checkmark-outline',
    description: 'Deep healing, immune renewal',
    longDescription:
      'Extended fasting goes beyond 72 hours, leading to significant metabolic and healing changes. Your body shifts to conserving protein while primarily using fat stores for energy. Growth hormone levels increase to preserve lean muscle mass, and the immune system may begin regenerating.',
  },
];

export const getCurrentStage = (elapsedSeconds) => {
  const reached = FASTING_STAGES.filter((s) => elapsedSeconds >= s.value);
  return reached.length > 0 ? reached[reached.length - 1] : FASTING_STAGES[0];
};

export const getReachedStages = (elapsedSeconds) => {
  return FASTING_STAGES.filter((s) => elapsedSeconds >= s.value);
};

export const getStagesReachedLabels = (elapsedSeconds) => {
  return getReachedStages(elapsedSeconds).map((s) => s.label);
};
