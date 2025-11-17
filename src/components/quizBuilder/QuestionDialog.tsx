import type { Question } from "@/types/question";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import QuestionForm from "./QuestionForm";

export type QuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingQuestion: Question | null;
  quizId: string;
};

export default function QuestionDialog({
  open,
  onOpenChange,
  editingQuestion,
  quizId,
}: QuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogDescription>
            {editingQuestion
              ? "Update the question details below."
              : "Fill in the question details below."}
          </DialogDescription>
        </DialogHeader>

        <QuestionForm
          onSubmit={() => onOpenChange(false)}
          question={editingQuestion}
          quizId={quizId}
        />
      </DialogContent>
    </Dialog>
  );
}
