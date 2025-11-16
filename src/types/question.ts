export const QuestionTypeEnum = {
  MCQ: 'mcq',
  Short: 'short',
} as const;

export type QuestionType = typeof QuestionTypeEnum[keyof typeof QuestionTypeEnum];

export interface Question {
  id: number;
  quizId: number;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

export type QuestionFormFields = Omit<Question, 'id' | 'quizId'>;
