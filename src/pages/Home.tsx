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
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QuestionnaireDialog from "@/components/questionnaire/QuestionnaireDialog"
import type { Attempt } from "@/types/attempt"

export default function Home() {
  const form = useForm<{ quizId: string }>({
    defaultValues: { quizId: "" },
  })

  const [attemptOpen, setAttemptOpen] = useState(false)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const startAttemptMutation = useMutation({
    mutationFn: async (quizId: string) => await attemptService.startAttempt(Number(quizId)),
    onSuccess: (response) => {
      setAttempt(response)
      setAttemptOpen(true)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      form.setError('quizId', { message: error.response?.data?.error || "Something went wrong" })
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="quizId"
            control={form.control}
            rules={{ required: "Quiz ID is required" }}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="quizId">Quiz ID</FieldLabel>
                <Input
                  {...field}
                  id="quizId"
                  type="number"
                  placeholder="Enter Quiz ID"
                />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
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

      {attemptOpen && attempt && (
        <Dialog open={attemptOpen} onOpenChange={setAttemptOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{attempt.quiz.title}</DialogTitle>
              {attempt.quiz.description && (
                <DialogDescription>{attempt.quiz.description}</DialogDescription>
              )}
            </DialogHeader>

            <QuestionnaireDialog attempt={attempt}/>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
