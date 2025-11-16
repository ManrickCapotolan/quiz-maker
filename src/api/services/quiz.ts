import { apiClient } from "../client";
import type { Quiz, QuizWithQuestions } from "../../types/quiz";
import type { Question } from "../../types/question";
import type { CreateQuizSchema } from "@/schemas/quiz.schema";

export const quizService = {
  getQuizzes: async () => {
    const result = await apiClient.get<Quiz[]>('/quizzes');
    return result.data;
  },
  createQuiz: async (data: CreateQuizSchema) => {
    const result = await apiClient.post<Quiz>('/quizzes', data);
    return result.data;
  },
  getQuizById: async (id: string) => {
    const result = await apiClient.get<QuizWithQuestions>(`/quizzes/${id}`);
    return result.data;
  },
  updateQuiz: async (id: string, data: Partial<CreateQuizSchema>) => {
    const result = await apiClient.put<Quiz>(`/quizzes/${id}`, data);
    return result.data;
  },
  createQuestion: async (id: string, data: Omit<Question, 'id' | 'quizId'>) => {
    const result = await apiClient.post<Question>(`/quizzes/${id}/questions`, data);
    return result.data;
  },
}

