export type RGB = readonly [number, number, number];

export const COLORS = {
  primary: [37, 99, 235] as const,
  primaryDark: [29, 78, 186] as const,
  accent: [22, 163, 74] as const,
  accentLight: [220, 252, 231] as const,
  dark: [15, 23, 42] as const,
  text: [51, 65, 85] as const,
  gray: [107, 114, 128] as const,
  lightGray: [241, 245, 249] as const,
  border: [226, 232, 240] as const,
  white: [255, 255, 255] as const,
  red: [239, 68, 68] as const,
  amber: [245, 158, 11] as const,
  yellow: [250, 204, 21] as const,
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
