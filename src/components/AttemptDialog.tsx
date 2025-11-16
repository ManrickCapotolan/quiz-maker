import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { attemptService } from "@/api/services/attempt"
import { AntiCheatEventEnum, type AntiCheatEventType, type AttemptResult } from "@/types/attempt"
import type { QuestionWithoutAnswer, QuizWithoutAnswers } from "@/types/quiz"
import { QuestionTypeEnum } from "@/types/question"

type AttemptDialogProps = {
  attemptId: number
  quiz: QuizWithoutAnswers
}

export default function AttemptDialog({
  attemptId,
  quiz,
}: AttemptDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<AttemptResult | null>(null)

  const recordEventMutation = useMutation({
    mutationFn: async (eventType: AntiCheatEventType) =>
      attemptService.recordEvent(attemptId, eventType),
  })

  const logAnswer = useMutation({
    mutationFn: async ({ questionId, value }: { questionId: number; value: string }) =>
      attemptService.logAnswer(Number(attemptId), { questionId, value }),
  })

  const submitAttempt = useMutation({
    mutationFn: async () => attemptService.submitAttempt(Number(attemptId)),
  })

  const questions = quiz?.questions || []
  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1
  const isFirstQuestion = currentStep === 0
  const isCompleted = results !== null

  useEffect(() => {
    if (!currentQuestion || isCompleted) return

    const handleBlur = () => {
      recordEventMutation.mutate(AntiCheatEventEnum.Blur)
    }
    window.addEventListener("blur", handleBlur)

    return () => window.removeEventListener("blur", handleBlur)
  }, [currentQuestion, isCompleted])

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)
  }

  const handleNext = async () => {
    if (!currentQuestion) return
    const value = answers[currentQuestion.id]
    if (!value) return
    try {
      await logAnswer.mutateAsync({ questionId: Number(currentQuestion.id), value })
      setCurrentStep((s) => Math.min(s + 1, questions.length - 1))
    } catch {
      // keep user on current question if logging fails
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion) return
    const value = answers[currentQuestion.id]
    if (!value) return
    try {
      await logAnswer.mutateAsync({ questionId: Number(currentQuestion.id), value })
    } catch {
      // proceed anyway to avoid trapping the user
    }
    try {
      const response = await submitAttempt.mutateAsync()
      setResults(response)
    } catch {
      // swallow
    }
  }

  return (
    <div className="space-y-6">
      {isCompleted && results ? (
        <div className="space-y-6">
          <div className="text-center py-2">
            <h3 className="text-2xl font-bold text-card-foreground mb-2">Quiz Completed!</h3>
            <p className="text-lg text-muted-foreground">
              Score: {results.score} / {results.details.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round((results.score / results.details.length) * 100)}%
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-card-foreground">Results:</h4>
            {results.details.map((result, index) => (
              <div key={result.questionId} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
                      {result.correct ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium text-card-foreground">{quiz.questions[index].prompt}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Your Answer: </span>
                        <span className={result.correct ? "text-green-600" : "text-red-600"}>
                          {quiz.questions[index].type === QuestionTypeEnum.MCQ
                            ? quiz.questions[index].options?.[Number(answers[quiz.questions[index].id])]
                            : answers[quiz.questions[index].id]
                            }
                        </span>
                      </div>
                      {!result.correct && (
                        <div>
                          <span className="font-medium text-muted-foreground">Correct Answer: </span>
                          <span className="text-green-600">{result.expected}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} / {questions.length} answered</span>
          </div>

          {currentQuestion && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  {currentQuestion.prompt}
                </h3>

                {currentQuestion.type === QuestionTypeEnum.MCQ && currentQuestion.options ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-md border border-input hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={String(index)}
                          checked={answers[currentQuestion.id] === String(index)}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Field>
                    <FieldLabel>Your Answer</FieldLabel>
                    <Input
                      type="text"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      onPaste={() => {
                        recordEventMutation.mutate(AntiCheatEventEnum.Paste)
                      }}
                      placeholder="Enter your answer"
                      className="w-full"
                    />
                  </Field>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={isFirstQuestion || logAnswer.isPending || submitAttempt.isPending}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !answers[currentQuestion.id] ||
                      submitAttempt.isPending ||
                      logAnswer.isPending ||
                      Object.keys(answers).length < questions.length
                    }
                  >
                    {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion.id] || logAnswer.isPending}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


