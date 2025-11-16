import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestion"
import QuestionDialog from "@/components/QuestionDialog"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/api/services/quiz"
import { QuestionTypeEnum } from "@/types/question"
import { quizKeys } from "@/lib/queryKeys"
import type { Question } from "@/types/question"

export default function QuizDetail() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: quizKeys.detail(quizId!),
    queryFn: () => quizService.getQuizById(quizId!),
    enabled: !!quizId,
  })

  const deleteQuestion = useDeleteQuestion()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const questions = data?.questions || []

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setDialogOpen(true)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizId) return
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      await deleteQuestion.mutateAsync({ quizId, questionId })
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const handleOpenDialog = () => {
    setEditingQuestion(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingQuestion(null)
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center">
        <p className="text-destructive">Error loading quiz</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go Home
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{data.title}</CardTitle>
            {data.description && (
              <CardDescription>{data.description}</CardDescription>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}> 
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">
              Questions ({questions.length}/10)
            </h2>
            <Button
              onClick={handleOpenDialog}
              disabled={questions.length >= 10}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {data.questions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions added yet.</p>
              <p className="text-sm mt-2">Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Q{index + 1}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                          {question.type}
                        </span>
                      </div>
                      <p className="font-medium text-card-foreground">{question.prompt}</p>
                      {question.type === QuestionTypeEnum.MCQ && question.options && (
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => {
                            const correctAnswerIndex = parseInt(question.correctAnswer, 10)
                            const isCorrect = optIndex === correctAnswerIndex
                            return (
                              <div
                                key={optIndex}
                                className={`text-sm pl-4 ${
                                  isCorrect
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {isCorrect && "✓ "}
                                {option}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {question.type === QuestionTypeEnum.Short && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Answer: </span>
                          {question.correctAnswer}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        // onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {quizId && (
        <QuestionDialog
          open={dialogOpen}
          closeDialog={handleCloseDialog}
          question={editingQuestion}
          quizId={quizId}
        />
      )}
    </Card>
  )
}

