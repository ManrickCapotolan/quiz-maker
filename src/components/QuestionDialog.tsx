import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { QuestionTypeEnum, type Question } from "@/types/question"
import { type UpsertQuestionSchema, upsertQuestionSchema } from "@/schemas/question.schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { quizService } from "@/api/services/quiz"
import { quizKeys } from "@/lib/queryKeys"
import { toast } from "sonner"
import { questionService } from "@/api/services/question"

interface QuestionDialogProps {
  open: boolean
  closeDialog: () => void
  question?: Question | null
  quizId: string
}

export default function QuestionDialog({
  open,
  closeDialog,
  question,
  quizId,
}: QuestionDialogProps) {
  const queryClient = useQueryClient();

  console.log('question', question);
  const {
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpsertQuestionSchema>({
    resolver: zodResolver(upsertQuestionSchema),
    defaultValues: question
      ? {
          prompt: question.prompt,
          type: question.type,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
        }
      : {
          prompt: "",
          type: QuestionTypeEnum.MCQ,
          options: ["", ""],
          correctAnswer: "0",
        },
  })

  const questionType = watch("type")
  const options = watch("options") || []
  const isMCQ = questionType === QuestionTypeEnum.MCQ;

  // Reset form values whenever the dialog opens or the target question changes
  React.useEffect(() => {
    if (!open) return;

    if (question) {
      reset({
        prompt: question.prompt,
        type: question.type,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
      })
    } else {
      reset({
        prompt: "",
        type: QuestionTypeEnum.MCQ,
        options: ["", ""],
        correctAnswer: "0",
      })
    }
  }, [open, question, reset])

  React.useEffect(() => {
    if (isDirty) {
      setValue("options", isMCQ ? ["", ""] : []);
    }
  }, [questionType]);

  const upsertQuestionMutation = useMutation({
    mutationFn: async (data: UpsertQuestionSchema) => {
      if (question) {
        return await questionService.updateQuestion(question.id, data)
      } else {
        return await quizService.createQuestion(quizId, data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) })

      if (question) {
        toast.success("Question updated successfully")
      } else {
        toast.success("Question created successfully")
      }

      closeDialog();
    },
    onError: (error) => {
      toast.error(`Error creating question: ${error.message}`);
    },
  })

  const handleFormSubmit = (data: UpsertQuestionSchema) => {
    upsertQuestionMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
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
          <Controller
            name="prompt"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="prompt">
                  Question Prompt
                </FieldLabel>
                <Input
                  {...field}
                  id="prompt"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter the question prompt"
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="type">
                  Question Type
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="type"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value={QuestionTypeEnum.MCQ}>Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value={QuestionTypeEnum.Short}>Text</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}  
          />

          {isMCQ && (
            <Field>
              <FieldLabel>Options (2-5 required)</FieldLabel>
              <div className=" space-y-2">
                {options.map((_, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Controller
                        name={`options.${optionIndex}` as const}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                        )}
                      />
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
                ))}
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
                    ? (errors.options as any).message
                    : "Please check your options"}
                </FieldError>
              )}
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="correctAnswer">Correct Answer</FieldLabel>
            {isMCQ ? (
              <Controller
                name="correctAnswer"
                control={control}
                render={({ field }) => (
                  <select
                    id="correctAnswer"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {options.map((option, optIndex) => (
                      <option key={optIndex} value={String(optIndex)}>
                        {option.trim() || `Option ${optIndex + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              />
            ) : (
              <Controller
                name="correctAnswer"
                control={control}
                render={({ field }) => (
                  <Input
                    key="text-answer"
                    id="correctAnswer"
                    type="text"
                    {...field}
                    placeholder="Enter the correct answer"
                    className={errors.correctAnswer ? "border-destructive" : ""}
                  />
                )}
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
              onClick={closeDialog}
              disabled={upsertQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertQuestionMutation.isPending}>
              {upsertQuestionMutation.isPending ? "Saving..." : question ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

