import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateQuiz } from "@/hooks/useQuiz"

const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  timeLimit: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true // Optional field
        const num = Number(val)
        return Number.isInteger(num) && num > 0
      },
      { message: "Time limit must be a positive number" }
    ),
})

type CreateQuizFormData = z.infer<typeof createQuizSchema>

export default function CreateQuiz() {
  const navigate = useNavigate()
  const createQuiz = useCreateQuiz()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizFormData>({
    resolver: zodResolver(createQuizSchema),
  })

  const onSubmit = async (data: CreateQuizFormData) => {
    try {
      const result = await createQuiz.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        timeLimit: data.timeLimit && data.timeLimit.trim() !== "" 
          ? Number(data.timeLimit) 
          : undefined,
      })
      // Navigate to quiz detail page
      navigate(`/quizzes/${result.quiz.id}`)
    } catch (error) {
      console.error("Error creating quiz:", error)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-card-foreground">
        Create a New Quiz
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter quiz title"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Enter quiz description (optional)"
            rows={4}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="timeLimit">Time Limit (seconds)</FieldLabel>
          <Input
            id="timeLimit"
            type="number"
            {...register("timeLimit")}
            placeholder="Enter time limit in seconds (optional)"
            className={errors.timeLimit ? "border-destructive" : ""}
          />
          {errors.timeLimit && <FieldError>{errors.timeLimit.message}</FieldError>}
        </Field>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </div>
  )
}
