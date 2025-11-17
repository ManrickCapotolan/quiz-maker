import type { QuizWithoutAnswers } from "./quiz";

export const AntiCheatEventEnum = {
  Blur: "blur",
  Paste: "paste",
} as const;

export type AntiCheatEventType =
  (typeof AntiCheatEventEnum)[keyof typeof AntiCheatEventEnum];

export interface Attempt {
  id: number;
  quizId: number;
  quiz: QuizWithoutAnswers;
}

export interface AttemptResult {
  score: number;
  details: Array<{
    questionId: number;
    correct: string;
    expected: string;
  }>;
}

export interface AttemptAnswer {
  questionId: number;
  value: string;
}

export interface AttemptEvent {
  event: AntiCheatEventType;
}
