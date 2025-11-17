import { QuestionTypeEnum, type Question } from "@/types/question";
import { Button } from "../ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { questionService } from "@/api/services/question";
import { quizKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type QuestionPreviewProps = {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
};

export default function QuestionPreview({
  question,
  index,
  onEdit,
}: QuestionPreviewProps) {
  const queryClient = useQueryClient();

  const isMCQ = question.type === QuestionTypeEnum.MCQ;
  const correctAnswer = isMCQ
    ? question.options![parseInt(question.correctAnswer, 10)]
    : question.correctAnswer;

  const deleteQuestionMutation = useMutation({
    mutationFn: async () => await questionService.deleteQuestion(question.id),
    onSuccess: async () => {
      toast.success("Question deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: quizKeys.detail(question.quizId.toString()),
      });
    },
    onError: (error) => {
      toast.error(`Error deleting question: ${error.message}`);
    },
  });

  return (
    <Item variant="outline">
      <ItemHeader className="items-center justify-between">
        <ItemTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Q{index + 1} - </span>
          <span className="text-primary">{question.prompt}</span>
        </ItemTitle>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(question)}
            disabled={deleteQuestionMutation.isPending}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteQuestionMutation.mutate()}
            disabled={deleteQuestionMutation.isPending}
          >
            {deleteQuestionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </ItemActions>
      </ItemHeader>

      <ItemContent className="flex flex-col gap-2">
        {isMCQ && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Options: </span>
            <span className="text-primary">{question.options!.join(", ")}</span>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Answer: </span>
          <span className="text-primary">{correctAnswer}</span>
        </div>
      </ItemContent>
    </Item>
  );
}
