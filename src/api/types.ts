// API Response types
export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

// Quiz types
export interface Quiz {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  questions?: Question[]
}

export interface Question {
  id: string
  quizId: string
  question: string
  type: "MCQ" | "text"
  options?: string[]
  correctAnswer: string // Always a string - for MCQ it's the stringified index, for text it's the answer
  order: number
}

export interface CreateQuestionRequest {
  quizId: string
  question: string
  type: "MCQ" | "text"
  options?: string[] // Required for MCQ, min 2, max 5
  correctAnswer: string // Always a string - for MCQ it's the stringified index, for text it's the answer
}

export interface CreateQuestionsRequest {
  quizId: string
  questions: CreateQuestionRequest[]
}

export interface CreateQuizRequest {
  title: string
  description?: string
  timeLimit?: number // Time limit in seconds
}

export interface UpdateQuizRequest {
  title?: string
  description?: string
}

export interface QuizResponse {
  quiz: Quiz
}

export interface QuizzesResponse {
  quizzes: Quiz[]
  total: number
}

// Quiz Attempt types
export interface QuizWithoutAnswers {
  id: string
  title: string
  description?: string
  timeLimit?: number
  questions: QuestionWithoutAnswer[]
}

export interface QuestionWithoutAnswer {
  id: string
  quizId: string
  question: string
  type: "MCQ" | "text"
  options?: string[]
  // No correctAnswer field - hidden from user
  order: number
}

export interface StartAttemptRequest {
  quizId: string
}

export interface StartAttemptResponse {
  attemptId: string
  quiz: QuizWithoutAnswers
}

export interface LogAnswerRequest {
  attemptId: string
  questionId: string
  value: string // User's answer
}

export interface LogAnswerResponse {
  success: boolean
}

export interface SubmitAttemptRequest {
  attemptId: string
}

export interface AnswerResult {
  questionId: string
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface SubmitAttemptResponse {
  attemptId: string
  score: number
  totalQuestions: number
  results: AnswerResult[]
}

