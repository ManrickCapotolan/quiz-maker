import { useMutation } from "@tanstack/react-query"
import { attemptService } from "@/api/services/attempt"
import type {
  StartAttemptRequest,
  LogAnswerRequest,
  SubmitAttemptRequest,
} from "@/api/types"

// Start attempt mutation
export function useStartAttempt() {
  return useMutation({
    mutationFn: (data: StartAttemptRequest) => attemptService.startAttempt(data),
  })
}

// Log answer mutation
export function useLogAnswer() {
  return useMutation({
    mutationFn: (data: LogAnswerRequest) => attemptService.logAnswer(data),
  })
}

// Submit attempt mutation
export function useSubmitAttempt() {
  return useMutation({
    mutationFn: (data: SubmitAttemptRequest) => attemptService.submitAttempt(data),
  })
}

