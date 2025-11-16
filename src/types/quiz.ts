import type { Question } from "./question";

export interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitSeconds: number;
  isPublished: boolean;
  createdAt: string;
}

export type QuizFormFields = Omit<Quiz, 'id' | 'createdAt'>;

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}
