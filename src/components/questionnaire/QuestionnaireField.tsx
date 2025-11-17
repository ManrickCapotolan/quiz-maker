import { QuestionTypeEnum } from "@/types/question";
import { Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "../ui/input";
import type { QuestionWithoutAnswer } from "@/types/quiz";

export type QuestionnaireFieldProps = {
  question: QuestionWithoutAnswer;
  answers: Record<string, string>;
  handleAnswerChange: (value: string) => void;
  handlePasteEvent: () => void;
};

export default function QuestionnaireField({
  question,
  answers,
  handlePasteEvent,
  handleAnswerChange,
}: QuestionnaireFieldProps) {
  const renderField = () => {
    switch (question.type) {
      case QuestionTypeEnum.MCQ:
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={handleAnswerChange}
          >
            {question.options!.map((option, index) => (
              <Field key={index} orientation="horizontal">
                <FieldLabel
                  htmlFor={`question-${question.id}-${index}`}
                  className="flex gap-3 p-3 border-accent border rounded-md cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem
                    value={String(index)}
                    id={`question-${question.id}-${index}`}
                  />
                  <span className="flex-1">{option}</span>
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        );
      case QuestionTypeEnum.Short:
        return (
          <Field>
            <Input
              type="text"
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onPaste={() => handlePasteEvent()}
              placeholder="Enter your answer"
            />
          </Field>
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <>
      <h4 className="font-semibold mb-2">{question.prompt}</h4>
      {renderField()}
    </>
  );
}
