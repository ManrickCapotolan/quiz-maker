import { apiClient } from "../client"
import type { ApiResult } from "../../types/api";
import type { AntiCheatEventType, Attempt, AttemptAnswer, AttemptResult } from "../../types/attempt";

export const attemptService = {
  startAttempt: async (quizId: number) => {
    const result = await apiClient.post<Attempt>('/attempts', { quizId });
    return result.data;
  },
  logAnswer: async (attemptId: number, answer: AttemptAnswer) => {
    const result = await apiClient.post<ApiResult>(`/attempts/${attemptId}/answer`, answer);
    return result.data;
  },
  submitAttempt: async (attemptId: number) => {
    const result = await apiClient.post<AttemptResult>(`/attempts/${attemptId}/submit`);
    return result.data;
  },
  recordEvent: async (attemptId: number, event: AntiCheatEventType) => {
    const result = await apiClient.post<ApiResult>(`/attempts/${attemptId}/events`, event);
    return result.data;
  },
}
