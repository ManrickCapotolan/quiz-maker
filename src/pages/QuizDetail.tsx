import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { quizService } from "@/api/services/quiz";
import { quizKeys } from "@/lib/queryKeys";
import type { Question } from "@/types/question";
import QuestionPreview from "@/components/quizBuilder/QuestionPreview";
import QuestionDialog from "@/components/quizBuilder/QuestionDialog";
import QuestionSkeleton from "@/components/quizBuilder/QuestionSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizDetail() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const quizDetailQuery = useQuery({
    queryKey: quizKeys.detail(quizId!),
    queryFn: () => quizService.getQuizById(quizId!),
    enabled: !!quizId,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const questions = quizDetailQuery.data?.questions || [];

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setDialogOpen(true);
  };

  const createQuestion = () => {
    setEditingQuestion(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
  };

  if (quizDetailQuery.isLoading) {
    return <QuestionSkeleton />;
  }

  if (quizDetailQuery.error || !quizDetailQuery.data) {
    return (
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Error loading quiz</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{quizDetailQuery.data.title}</CardTitle>
            {quizDetailQuery.data.description && (
              <CardDescription className="mt-2">
                {quizDetailQuery.data.description}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {quizDetailQuery.isFetching ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Questions ({questions.length}/10)
              </h3>

              <Button
                variant="outline"
                onClick={createQuestion}
                disabled={questions.length >= 10}
              >
                Add Question
              </Button>
            </div>

            {questions?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                Click "Add Question" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionPreview
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={editQuestion}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>

      {quizId && (
        <QuestionDialog
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
          editingQuestion={editingQuestion}
          quizId={quizId}
        />
      )}
    </Card>
  );
}
