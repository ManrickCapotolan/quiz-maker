import { Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useMutation } from "@tanstack/react-query"
import { attemptService } from "@/api/services/attempt"
import type { AxiosError } from "axios"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ErrorResponse } from "@/types/api"
import AttemptDialog from "@/components/AttemptDialog"
import type { QuizWithoutAnswers } from "@/api/types"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Home() {
  const { control, handleSubmit, setError, formState: { errors } } = useForm<{ quizId: string }>({
    defaultValues: { quizId: "" },
  })

  const [attemptOpen, setAttemptOpen] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [attemptQuiz, setAttemptQuiz] = useState<QuizWithoutAnswers | null>(null)

  const startAttemptMutation = useMutation({
    mutationFn: async (quizId: string) => await attemptService.startAttempt(Number(quizId)),
    onSuccess: (response) => {
      const id = (response as any).id
      const quiz = ((response as any).quiz) as QuizWithoutAnswers
      setAttemptId(Number(id))
      setAttemptQuiz(quiz)
      setAttemptOpen(true)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      setError('quizId', { message: error.response?.data?.error || "Something went wrong" })
    },
  })

  const onSubmit = (data: { quizId: string }) => {
    startAttemptMutation.mutate(data.quizId)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>QUIZ MAKER</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="quizId"
            control={control}
            rules={{ required: "Quiz ID is required" }}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="quizId">Quiz ID</FieldLabel>
                <Input
                  id="quizId"
                  type="number"
                  placeholder="Enter Quiz ID"
                  className="w-full"
                  {...field}
                />
                {errors.quizId && <FieldError>{errors.quizId.message}</FieldError>}
              </Field>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={startAttemptMutation.isPending}
          >
            {startAttemptMutation.isPending ? "Starting..." : "Start Quiz"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link to="/quizzes/new" className="text-sm text-primary hover:underline">
          Create a new quiz
        </Link>
      </CardFooter>

      {attemptOpen && attemptId !== null && attemptQuiz && (
        <Dialog open={attemptOpen} onOpenChange={setAttemptOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{attemptQuiz.title}</DialogTitle>
              {attemptQuiz.description && (
                <DialogDescription>{attemptQuiz.description}</DialogDescription>
              )}
            </DialogHeader>

            <AttemptDialog
              attemptId={attemptId}
              quiz={attemptQuiz}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
