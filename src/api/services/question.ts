import { apiClient } from "../client";
import type { Question, QuestionFormFields } from "../../types/question";

export const questionService = {
  updateQuestion: async (id: number, data: QuestionFormFields) => {
    const result = await apiClient.patch<Question>(`/questions/${id}`, data);
    return result.data;
  },
  deleteQuestion: async (id: number) => {
    const result = await apiClient.delete<void>(`/questions/${id}`);
    return result.data;
  },
};
