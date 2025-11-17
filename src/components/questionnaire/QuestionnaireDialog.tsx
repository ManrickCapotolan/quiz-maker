import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { attemptService } from "@/api/services/attempt"
import type{ AttemptResult } from "@/types/attempt"
import QuestionnaireSummary from "./QuestionnaireSummary"
import QuestionnaireField from "./QuestionnaireField"
import type { Attempt } from "@/types/attempt"
import { useAntiCheatDetector } from "@/hooks/useAntiCheatDetector"

type QuestionnaireDialogProps = {
  attempt: Attempt
}

export default function QuestionnaireDialog({
  attempt,
}: QuestionnaireDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<AttemptResult | null>(null)
  const { antiCheatEvents, logPasteEvent } = useAntiCheatDetector({ attemptId: attempt.id });

  const logAnswer = useMutation({
    mutationFn: async ({ questionId, value }: { questionId: number; value: string }) =>
      attemptService.logAnswer(attempt.id, { questionId, value }),
  })

  const submitAttempt = useMutation({
    mutationFn: async () => attemptService.submitAttempt(attempt.id),
  })

  const questions = attempt.quiz?.questions || []
  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1
  const isFirstQuestion = currentStep === 0
  const isCompleted = results !== null

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)
  }

  const handleNext = async () => {
    const value = answers[currentQuestion.id];
    await logAnswer.mutateAsync({ questionId: Number(currentQuestion.id), value });

    if (isLastQuestion) {
      const response = await submitAttempt.mutateAsync();
      setResults(response);
    } else {
      setCurrentStep((step) => step + 1);
    }
  }

  if (!questions.length) {
    return (
      <p className="flex justify-center items-center h-full">
        No questions found
      </p>
    )
  }

  if (isCompleted) {
    return (
      <QuestionnaireSummary quiz={attempt.quiz} answers={answers} summary={results} antiCheatEvents={antiCheatEvents} />
    )
  }
  
  return (
    <>
      <div className="flex justify-end text-sm">
        <span>Question {currentStep + 1} of {questions.length}</span>
      </div>

      <div className="space-y-4">
        <QuestionnaireField
          question={currentQuestion}
          answers={answers}
          handleAnswerChange={handleAnswerChange}
          handlePasteEvent={logPasteEvent}
        />

        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((step) => step - 1)}
            disabled={isFirstQuestion || logAnswer.isPending || submitAttempt.isPending}
          >
            <ChevronLeft />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id] || logAnswer.isPending || submitAttempt.isPending}
          >
            {submitAttempt.isPending || logAnswer.isPending ? "Submitting..." : "Submit"}
            <ChevronRight />
          </Button>
        </div>
      </div>
    </>
  )
}


