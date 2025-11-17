import type { QuizWithoutAnswers } from "@/types/quiz"
import { AntiCheatEventEnum, type AntiCheatEventType, type AttemptResult } from "@/types/attempt"
import { CheckCircle2, XCircle } from "lucide-react"
import { QuestionTypeEnum } from "@/types/question"

type QuestionnaireSummaryProps = {
  answers: Record<string, string>
  quiz: QuizWithoutAnswers
  summary: AttemptResult
  antiCheatEvents: Record<AntiCheatEventType, number>
}

export default function QuestionnaireSummary({
  answers,
  quiz,
  summary,
  antiCheatEvents
}: QuestionnaireSummaryProps) {
  return (
    <>
      <div className="text-center py-2">
        <h2 className="font-bold">Quiz Completed!</h2>
        <p>Score: {summary.score} / {summary.details.length}</p>
      </div>

      <div className="text-sm text-muted-foreground space-y-4">
        {summary.details.map((result, index) => {
          const question = quiz.questions[index];

          return (
            <div key={result.questionId} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-card-foreground">Q{index + 1}</span>
                <p>{question.prompt}</p>
                {result.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div>
                <span className="font-medium">Your Answer: </span>
                <span className={result.correct ? "text-green-600" : "text-red-600"}>
                  {question.type === QuestionTypeEnum.MCQ
                    ? question.options?.[Number(answers[question.id])]
                    : answers[question.id]
                    }
                </span>
              </div>

              {!result.correct && (
                <div>
                  <span className="font-medium">Correct Answer: </span>
                  <span className="text-green-600">{result.expected}</span>
                </div>
              )}
            </div>
          )
        })}

        <div>
          <p>Paste Events: <span className="text-card-foreground font-medium">{antiCheatEvents[AntiCheatEventEnum.Paste]}</span></p>
          <p>Blur Events: <span className="text-card-foreground font-medium">{antiCheatEvents[AntiCheatEventEnum.Blur]}</span></p>
        </div>
      </div>
    </>
  )
}