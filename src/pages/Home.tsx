import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useStartAttempt } from "@/hooks/useAttempt"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function Home() {
  const navigate = useNavigate()
  const startAttempt = useStartAttempt()

  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<{ quizId: string }>({
    defaultValues: { quizId: "" },
  })
  const quizId = watch("quizId")

  const onSubmit = (data: { quizId: string }) => {
    console.log('QUIZ ID', quizId);
    startAttempt.mutate(
      { quizId: data.quizId.trim() },
      {
        onSuccess: (response) => {
          navigate(`/attempts/${response.attemptId}`)
        },
        onError: (error) => {
          setError('quizId', { message: error.message });
        },
      }
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>QUIZ MAKER</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Field>
            <FieldLabel htmlFor="quizId">Quiz ID</FieldLabel>
            <Input
              id="quizId"
              type="text"
              placeholder="Enter Quiz ID"
              {...register("quizId", { required: "Quiz ID is required" })}
              className="w-full"
            />
            {errors.quizId && <FieldError>{errors.quizId.message}</FieldError>}
          </Field>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Start Quiz"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link to="/quizzes/new" className="text-sm text-primary hover:underline">
          Create a new quiz
        </Link>
      </CardFooter>
    </Card>
  )
}
