import { z } from "zod";

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  timeLimitSeconds: z.number().min(120).max(600),
  isPublished: z.boolean(),
});

export type CreateQuizSchema = z.infer<typeof createQuizSchema>;
