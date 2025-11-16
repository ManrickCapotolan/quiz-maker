import { useQuery, useMutation } from "@tanstack/react-query"
import { quizService } from "@/api/services/quiz"
import type { CreateQuizSchema } from "@/schemas/quiz.schema"

export const quizKeys = {
  all: ["quizzes"] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
}

export function useQuiz(id: string | null) {
  return useQuery({
    queryKey: quizKeys.detail(id!),
    queryFn: () => quizService.getQuizById(id!),
    enabled: !!id,
  })
}

// Create quiz mutation
export function useCreateQuiz() {
  return useMutation({
    mutationFn: (data: CreateQuizSchema) => quizService.createQuiz(data),
  })
}
