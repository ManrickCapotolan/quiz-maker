import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { questionService } from "@/api/services/question"
import type { CreateQuestionRequest, CreateQuestionsRequest } from "@/api/types"
import { quizKeys } from "./useQuiz"

// Query keys for questions
export const questionKeys = {
  all: ["questions"] as const,
  byQuiz: (quizId: string) => [...questionKeys.all, "quiz", quizId] as const,
}

// Get questions for a quiz
export function useQuestionsByQuiz(quizId: string | null) {
  return useQuery({
    queryKey: questionKeys.byQuiz(quizId!),
    queryFn: () => questionService.getQuestionsByQuizId(quizId!),
    enabled: !!quizId,
  })
}

// Create a single question mutation
export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => questionService.createQuestion(data),
    onSuccess: (_, variables) => {
      // Invalidate questions for this quiz
      queryClient.invalidateQueries({ queryKey: questionKeys.byQuiz(variables.quizId) })
      // Invalidate the quiz detail to refresh quiz data including questions
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

// Create multiple questions mutation
export function useCreateQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuestionsRequest) => questionService.createQuestions(data),
    onSuccess: (_, variables) => {
      // Invalidate questions for this quiz
      queryClient.invalidateQueries({ queryKey: questionKeys.byQuiz(variables.quizId) })
      // Also invalidate the quiz detail
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

// Update question mutation
export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quizId,
      questionId,
      data,
    }: {
      quizId: string
      questionId: string
      data: Partial<CreateQuestionRequest>
    }) => questionService.updateQuestion(quizId, questionId, data),
    onSuccess: (_, variables) => {
      // Invalidate questions for this quiz
      queryClient.invalidateQueries({ queryKey: questionKeys.byQuiz(variables.quizId) })
      // Invalidate the quiz detail to refresh quiz data including questions
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

// Delete question mutation
export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      questionService.deleteQuestion(quizId, questionId),
    onSuccess: (_, variables) => {
      // Invalidate questions for this quiz
      queryClient.invalidateQueries({ queryKey: questionKeys.byQuiz(variables.quizId) })
      // Invalidate the quiz detail to refresh quiz data including questions
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) })
    },
  })
}

