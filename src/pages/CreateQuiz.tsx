import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { createQuizSchema, type CreateQuizSchema } from "@/schemas/quiz.schema";
import { quizService } from "@/api/services/quiz";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CreateQuiz() {
  const navigate = useNavigate();

  const form = useForm<CreateQuizSchema>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimitSeconds: 300,
      isPublished: true,
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: CreateQuizSchema) =>
      await quizService.createQuiz(data),
    onSuccess: (data) => {
      navigate(`/quizzes/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Error creating quiz: ${error.message}`);
    },
  });

  const onSubmit = async (data: CreateQuizSchema) => {
    createQuizMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardTitle>Create a New Quiz</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input {...field} id="title" placeholder="Enter quiz title" />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Enter quiz description (optional)"
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="timeLimitSeconds"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="timeLimitSeconds">
                  Time Limit (seconds)
                </FieldLabel>
                <Slider
                  id="timeLimitSeconds"
                  value={[field.value]}
                  min={120}
                  max={600}
                  step={30}
                  onValueChange={(val: number[]) => field.onChange(val[0])}
                />
                <div className="text-sm">
                  {form.watch("timeLimitSeconds")} seconds
                </div>
              </Field>
            )}
          />

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={createQuizMutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={createQuizMutation.isPending}>
              {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
