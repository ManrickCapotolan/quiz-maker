import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import type {
  QuizWithoutAnswers,
  SubmitAttemptResponse,
} from "@/api/types"
import { useMutation } from "@tanstack/react-query"
import { attemptService } from "@/api/services/attempt"
import { logAttemptEvent } from "@/api/services/attemptEvent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Attempt() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<QuizWithoutAnswers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<SubmitAttemptResponse | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mutations defined locally
  const logAnswer = useMutation({
    mutationFn: async ({ attemptId, questionId, value }: { attemptId: string; questionId: string; value: string }) =>
      attemptService.logAnswer(Number(attemptId), { questionId: Number(questionId), value }),
  })

  const submitAttempt = useMutation({
    mutationFn: async ({ attemptId }: { attemptId: string }) => attemptService.submitAttempt(Number(attemptId)),
  })

  // Load attempt data on mount via API
  useEffect(() => {
    const load = async () => {
      if (!attemptId) {
        setError("Invalid attempt ID")
        setLoading(false)
        return
      }

      try {
        const data = await attemptService.getAttempt(Number(attemptId))
        // Expecting shape: { quiz: QuizWithoutAnswers, answers?: Record<string,string> }
        const apiQuiz = (data.quiz || data) as QuizWithoutAnswers
        if (!apiQuiz || !apiQuiz.questions || apiQuiz.questions.length === 0) {
          setError("Quiz data not found")
          setLoading(false)
          return
        }

        setQuiz(apiQuiz)
        setAnswers((data.answers as Record<string, string>) || {})
      } catch (err: any) {
        setError(err?.response?.data?.error || "Error loading attempt")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [attemptId])

  const questions = quiz?.questions || []
  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1
  const isFirstQuestion = currentStep === 0
  const isCompleted = results !== null

  // Set up window blur event listener to detect when user tabs out
  useEffect(() => {
    if (!attemptId || !currentQuestion || isCompleted) return

    const handleBlur = () => {
      logAttemptEvent({
        attemptId,
        questionId: currentQuestion.id,
        eventType: "blur",
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("blur", handleBlur)
    }
  }, [attemptId, currentQuestion, isCompleted])

  const handleAnswerChange = (value: string) => {
    if (!attemptId || !currentQuestion) return

    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    // Log answer via API
    logAnswer.mutate({
      attemptId,
      questionId: currentQuestion.id,
      value,
    })
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!attemptId) return

    try {
      const response = await submitAttempt.mutateAsync({ attemptId })
      // Map backend AttemptResult to SubmitAttemptResponse if needed
      setResults(response as unknown as SubmitAttemptResponse)
    } catch (error) {
      console.error("Error submitting attempt:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Quiz not found"}</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex-row items-start justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}> 
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </CardHeader>

        {isCompleted && results ? (
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-2xl font-bold text-card-foreground mb-2">
                Quiz Completed!
              </h3>
              <p className="text-lg text-muted-foreground">
                Score: {results.score} / {results.totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((results.score / results.totalQuestions) * 100)}%
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-card-foreground">Results:</h4>
              {results.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Q{index + 1}
                        </span>
                        {result.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="font-medium text-card-foreground">{result.question}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Your Answer:{" "}
                          </span>
                          <span
                            className={
                              result.isCorrect ? "text-green-600" : "text-red-600"
                            }
                          >
                            {result.userAnswer}
                          </span>
                        </div>
                        {!result.isCorrect && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Correct Answer:{" "}
                            </span>
                            <span className="text-green-600">{result.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => navigate("/")}>Back to Home</Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>
                {Object.keys(answers).length} / {questions.length} answered
              </span>
            </div>

            {/* Question */}
            {currentQuestion && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.type === "MCQ" && currentQuestion.options ? (
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
                        ref={inputRef}
                        type="text"
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        onPaste={(e) => {
                          if (!attemptId || !currentQuestion) return
                          
                          const pastedText = e.clipboardData.getData("text")
                          logAttemptEvent({
                            attemptId,
                            questionId: currentQuestion.id,
                            eventType: "paste",
                            timestamp: new Date().toISOString(),
                            value: pastedText,
                          })
                        }}
                        placeholder="Enter your answer"
                        className="w-full"
                      />
                    </Field>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
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
                        Object.keys(answers).length < questions.length
                      }
                    >
                      {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  ) : (
                    <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

