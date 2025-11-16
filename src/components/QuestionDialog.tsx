import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import type { Question } from "@/api/types"

const questionSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  type: z.enum(["MCQ", "text"]),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .optional()
    .refine(
      (options) => {
        if (!options) return true
        // Check for duplicates (case-insensitive, trimmed)
        const trimmed = options.map((opt) => opt.trim().toLowerCase())
        return new Set(trimmed).size === trimmed.length
      },
      { message: "Options must be unique" }
    ),
  correctAnswer: z.string().min(1, "Correct answer is required"),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: QuestionFormData) => Promise<void>
  question?: Question | null
  quizId: string
}

export default function QuestionDialog({
  open,
  onOpenChange,
  onSubmit,
  question,
}: QuestionDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
          prompt: question.question,
          type: question.type,
          options: question.options || [],
          correctAnswer: question.correctAnswer, // Already a string
        }
      : {
          prompt: "",
          type: "MCQ" as const,
          options: ["", ""],
          correctAnswer: "0", // String from the start
        },
  })

  const questionType = watch("type")
  const options = watch("options") || []
  const isMCQ = questionType === "MCQ"

  // Reset form when dialog opens/closes or question changes
  React.useEffect(() => {
    if (open) {
      if (question) {
        reset({
          prompt: question.question,
          type: question.type,
          options: question.options || [],
          correctAnswer: question.correctAnswer, // Already a string
        })
      } else {
        reset({
          prompt: "",
          type: "MCQ" as const,
          options: ["", ""],
          correctAnswer: "0", // String from the start
        })
      }
    }
  }, [open, question, reset])

  const handleFormSubmit = async (data: QuestionFormData) => {
    // Validate MCQ requirements
    if (data.type === "MCQ") {
      if (!data.options || data.options.length < 2 || data.options.length > 5) {
        return
      }
      if (data.options.some((opt) => !opt || opt.trim() === "")) {
        return
      }
      // For MCQ, correctAnswer should be a stringified index
      const correctAnswerIndex = parseInt(data.correctAnswer, 10)
      if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= data.options.length) {
        return
      }
    } else {
      // For text, correctAnswer should be a non-empty string
      if (data.correctAnswer.trim() === "") {
        return
      }
    }

    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>
            {question
              ? "Update the question details below."
              : "Fill in the question details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="prompt">Prompt</FieldLabel>
            <Textarea
              id="prompt"
              {...register("prompt")}
              placeholder="Enter the question prompt"
              rows={3}
              className={errors.prompt ? "border-destructive" : ""}
            />
            {errors.prompt && <FieldError>{errors.prompt.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <select
              id="type"
              {...register("type", {
                onChange: (e) => {
                  const newType = e.target.value
                  if (newType === "text") {
                    // Clear options and reset correctAnswer to empty string
                    setValue("options", undefined, { shouldValidate: false })
                    setValue("correctAnswer", "", { shouldValidate: false })
                  } else {
                    setValue("options", ["", ""], { shouldValidate: false })
                    setValue("correctAnswer", "0", { shouldValidate: false })
                  }
                },
              })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            >
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="text">Text</option>
            </select>
            {errors.type && <FieldError>{errors.type.message}</FieldError>}
          </Field>

          {isMCQ && (
            <Field>
              <FieldLabel>Options (2-5 required, no duplicates)</FieldLabel>
              <div className="space-y-2">
                {options.map((_, optionIndex) => {
                  const optionValue = options[optionIndex] || ""
                  const trimmedOptions = options.map((opt) => opt.trim().toLowerCase())
                  const isDuplicate =
                    optionValue.trim() &&
                    trimmedOptions.filter((opt) => opt === optionValue.trim().toLowerCase())
                      .length > 1

                  return (
                    <div key={optionIndex} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          {...register(`options.${optionIndex}` as const)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className={isDuplicate ? "border-destructive" : ""}
                        />
                        {isDuplicate && (
                          <p className="text-xs text-destructive mt-1">
                            This option is a duplicate
                          </p>
                        )}
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            const newOptions = [...options]
                            newOptions.splice(optionIndex, 1)
                            setValue("options", newOptions)
                            const currentAnswer = watch("correctAnswer")
                            const currentAnswerIndex = parseInt(currentAnswer, 10)
                            if (!isNaN(currentAnswerIndex) && currentAnswerIndex >= newOptions.length) {
                              setValue("correctAnswer", String(Math.max(0, newOptions.length - 1)))
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
                {options.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentOptions = watch("options") || []
                      setValue("options", [...currentOptions, ""])
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
              {errors.options && (
                <FieldError>
                  {typeof errors.options === "object" && "message" in errors.options
                    ? errors.options.message
                    : "Please check your options"}
                </FieldError>
              )}
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="correctAnswer">Correct Answer</FieldLabel>
            {isMCQ ? (
              <select
                id="correctAnswer"
                {...register("correctAnswer")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              >
                {options.map((option, optIndex) => (
                  <option key={optIndex} value={String(optIndex)}>
                    {option.trim() || `Option ${optIndex + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                key="text-answer" // Force re-render when type changes
                id="correctAnswer"
                type="text"
                {...register("correctAnswer")}
                placeholder="Enter the correct answer"
                className={errors.correctAnswer ? "border-destructive" : ""}
              />
            )}
            {errors.correctAnswer && (
              <FieldError>{errors.correctAnswer.message}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : question ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

