import { QuestionTypeEnum } from "@/types/question"
import { z } from "zod"

export const upsertQuestionSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required"),
  type: z
    .enum(Object.values(QuestionTypeEnum)),
  options: z
    .array(z.string().min(1, "Option is required")).optional()
    .refine(
      (options) => {
        if (!options) return true

        const trimmed = options.map((opt) => opt.trim().toLowerCase())
        return new Set(trimmed).size === trimmed.length
      },
      { message: "Options must be unique" }
    ),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

export type UpsertQuestionSchema = z.infer<typeof upsertQuestionSchema>;
