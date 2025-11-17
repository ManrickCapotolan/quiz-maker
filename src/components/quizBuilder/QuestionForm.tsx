import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Plus, Trash2 } from "lucide-react";
import { QuestionTypeEnum, type Question } from "@/types/question";
import {
  type UpsertQuestionSchema,
  upsertQuestionSchema,
} from "@/schemas/question.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/api/services/quiz";
import { quizKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { questionService } from "@/api/services/question";
import { useEffect } from "react";

interface QuestionFormProps {
  onSubmit: () => void;
  question?: Question | null;
  quizId: string;
}

export default function QuestionForm({
  onSubmit,
  question,
  quizId,
}: QuestionFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<UpsertQuestionSchema>({
    resolver: zodResolver(upsertQuestionSchema),
    defaultValues: {
      prompt: question?.prompt || "",
      type: question?.type || QuestionTypeEnum.MCQ,
      options: question?.options || ["", ""],
      correctAnswer: question?.correctAnswer || "0",
    },
  });

  const questionType = form.watch("type");
  const options = form.watch("options") || [];
  const isMCQ = questionType === QuestionTypeEnum.MCQ;

  useEffect(() => {
    if (form.formState.isDirty) {
      form.setValue("options", isMCQ ? ["", ""] : []);
    }
  }, [questionType]);

  const upsertQuestionMutation = useMutation({
    mutationFn: async (data: UpsertQuestionSchema) => {
      if (question) {
        return await questionService.updateQuestion(question.id, data);
      } else {
        return await quizService.createQuestion(quizId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
      toast.success(question ? "Question updated successfully" : "Question created successfully");
      onSubmit();
    },
    onError: (error) => {
      toast.error(`Error creating question: ${error.message}`);
    },
  });

  const handleFormSubmit = (data: UpsertQuestionSchema) => {
    upsertQuestionMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
      <Controller
        name="prompt"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="prompt">Question Prompt</FieldLabel>
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
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="type">Question Type</FieldLabel>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="type" aria-invalid={fieldState.invalid}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value={QuestionTypeEnum.MCQ}>
                  Multiple Choice (MCQ)
                </SelectItem>
                <SelectItem value={QuestionTypeEnum.Short}>Text</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
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
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    )}
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      const newOptions = [...options];
                      newOptions.splice(optionIndex, 1);
                      form.setValue("options", newOptions);
                      form.setValue("correctAnswer", "0"); // Todo: better if we retain previous selection
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
                  const currentOptions = form.watch("options") || [];
                  form.setValue("options", [...currentOptions, ""]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>
          {form.formState.errors.options && (
            <FieldError>
              {typeof form.formState.errors.options === "object" &&
              "message" in form.formState.errors.options
                ? form.formState.errors.options.message
                : "Please check your options"}
            </FieldError>
          )}
        </Field>
      )}

      <Controller
        name="correctAnswer"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <>
              {isMCQ ? (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="correctAnswer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {options.map((option, optIndex) => (
                      <SelectItem key={optIndex} value={String(optIndex)}>
                        {option.trim() || `Option ${optIndex + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  key="text-answer"
                  id="correctAnswer"
                  type="text"
                  {...field}
                  placeholder="Enter the correct answer"
                  className={fieldState.error ? "border-destructive" : ""}
                />
              )}
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </>
          );
        }}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSubmit}
          disabled={upsertQuestionMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={upsertQuestionMutation.isPending}>
          {upsertQuestionMutation.isPending
            ? "Saving..."
            : question
            ? "Update"
            : "Add"}
        </Button>
      </div>
    </form>
  );
}
