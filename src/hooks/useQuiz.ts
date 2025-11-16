import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { quizService } from "@/api/services/quiz"
import type { CreateQuizRequest, UpdateQuizRequest } from "@/api/types"

// Query keys - centralized for consistency
export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (filters: string) => [...quizKeys.lists(), { filters }] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
}

// Get all quizzes
export function useQuizzes() {
  return useQuery({
    queryKey: quizKeys.lists(),
    queryFn: () => quizService.getQuizzes(),
  })
}

// Get quiz by ID
export function useQuiz(id: string | null) {
  return useQuery({
    queryKey: quizKeys.detail(id!),
    queryFn: () => quizService.getQuizById(id!),
    enabled: !!id, // Only run query if id is provided
  })
}

// Create quiz mutation
export function useCreateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuizRequest) => quizService.createQuiz(data),
    onSuccess: () => {
      // Invalidate and refetch quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
    },
  })
}

// Update quiz mutation
export function useUpdateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizRequest }) =>
      quizService.updateQuiz(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific quiz and list
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
    },
  })
}

// Delete quiz mutation
export function useDeleteQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quizService.deleteQuiz(id),
    onSuccess: () => {
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() })
    },
  })
}

