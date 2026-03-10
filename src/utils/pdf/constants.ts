export type RGB = readonly [number, number, number];

export const COLORS = {
  headerDark: [35, 28, 22] as const,
  headerMid: [55, 38, 28] as const,
  headerLight: [75, 50, 35] as const,
  orange: [243, 115, 33] as const,
  orangeLight: [255, 165, 90] as const,
  orangeBg: [253, 237, 224] as const,
  dark: [15, 23, 42] as const,
  text: [51, 65, 85] as const,
  gray: [107, 114, 128] as const,
  lightGray: [245, 245, 247] as const,
  border: [226, 232, 240] as const,
  white: [255, 255, 255] as const,
  red: [239, 68, 68] as const,
  navyTag: [30, 45, 70] as const,
} as const;

export interface Evaluation {
  evaluator_id: string;
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

export interface SelfEvaluation {
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

export interface EvaluatorProfile {
  name: string;
  email: string;
}

export const MARGIN = 20;
