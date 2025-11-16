import type {
  StartAttemptRequest,
  StartAttemptResponse,
  LogAnswerRequest,
  LogAnswerResponse,
  SubmitAttemptRequest,
  SubmitAttemptResponse,
  Question,
} from "../types"

// localStorage keys
const STORAGE_ATTEMPTS_KEY = "quiz-maker-attempts"
const STORAGE_QUESTIONS_KEY = "quiz-maker-questions"
const STORAGE_QUIZZES_KEY = "quiz-maker-quizzes"

// Helper functions
const getStoredQuestions = (): Record<string, Question[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_QUESTIONS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const getStoredQuizzes = (): Record<string, { id: string; title: string; description?: string; timeLimit?: number }> => {
  try {
    const stored = localStorage.getItem(STORAGE_QUIZZES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const getStoredAttempts = (): Record<string, { answers: Record<string, string>; quizId?: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_ATTEMPTS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const setStoredAttempts = (attempts: Record<string, { answers: Record<string, string>; quizId?: string }>) => {
  try {
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts))
  } catch (error) {
    console.error("Error saving attempts to localStorage:", error)
  }
}

// Attempt API endpoints
export const attemptService = {
  // Start a quiz attempt
  startAttempt: async (data: StartAttemptRequest): Promise<StartAttemptResponse> => {
    console.log("📤 API Call: startAttempt", JSON.stringify(data, null, 2))
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Get quiz metadata and questions from localStorage
        const storedQuizzes = getStoredQuizzes()
        const storedQuestions = getStoredQuestions()
        const quiz = storedQuizzes[data.quizId]
        const questions = storedQuestions[data.quizId] || []
        
        // Check if quiz exists - must have quiz metadata and at least one question
        if (!quiz || questions.length === 0) {
          console.log("📥 API Response: startAttempt - NOT FOUND")
          reject(new Error("Quiz not found"))
          return
        }
        
        // Create attempt ID
        const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Initialize attempt answers
        const storedAttempts = getStoredAttempts()
        storedAttempts[attemptId] = { answers: {}, quizId: data.quizId }
        setStoredAttempts(storedAttempts)
        
        // Return quiz without correct answers
        const questionsWithoutAnswers = questions.map((q) => {
          const { correctAnswer, ...questionWithoutAnswer } = q
          return questionWithoutAnswer
        })
        
        const response: StartAttemptResponse = {
          attemptId,
          quiz: {
            id: data.quizId,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            questions: questionsWithoutAnswers,
          },
        }
        
        console.log("📥 API Response: startAttempt", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Log an answer for a question
  logAnswer: async (data: LogAnswerRequest): Promise<LogAnswerResponse> => {
    console.log("📤 API Call: logAnswer", JSON.stringify(data, null, 2))
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedAttempts = getStoredAttempts()
        if (!storedAttempts[data.attemptId]) {
          storedAttempts[data.attemptId] = { answers: {} }
        }
        
        storedAttempts[data.attemptId].answers[data.questionId] = data.value
        setStoredAttempts(storedAttempts)
        
        const response: LogAnswerResponse = { success: true }
        console.log("📥 API Response: logAnswer", JSON.stringify(response, null, 2))
        resolve(response)
      }, 300)
    })
  },

  // Submit attempt and get results
  submitAttempt: async (data: SubmitAttemptRequest): Promise<SubmitAttemptResponse> => {
    console.log("📤 API Call: submitAttempt", JSON.stringify(data, null, 2))
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedAttempts = getStoredAttempts()
        const attempt = storedAttempts[data.attemptId]
        
        if (!attempt) {
          reject(new Error("Attempt not found"))
          return
        }
        
        // Get quizId from attempt or find it
        const quizId = attempt.quizId || ""
        const storedQuestions = getStoredQuestions()
        const allQuestions: Question[] = storedQuestions[quizId] || []
        
        if (!quizId || !allQuestions.length) {
          reject(new Error("Quiz not found for this attempt"))
          return
        }
        
        // Compare answers and calculate score
        const results = allQuestions.map((question) => {
          const userAnswer = attempt.answers[question.id] || ""
          const correctAnswer = question.correctAnswer
          let isCorrect = false
          let displayUserAnswer = userAnswer
          let displayCorrectAnswer = correctAnswer
          
          if (question.type === "MCQ") {
            // For MCQ, compare the index
            const userIndex = parseInt(userAnswer, 10)
            const correctIndex = parseInt(correctAnswer, 10)
            isCorrect = userIndex === correctIndex
            
            // Display the actual option text instead of index
            if (question.options && !isNaN(userIndex) && userIndex >= 0 && userIndex < question.options.length) {
              displayUserAnswer = question.options[userIndex]
            }
            if (question.options && !isNaN(correctIndex) && correctIndex >= 0 && correctIndex < question.options.length) {
              displayCorrectAnswer = question.options[correctIndex]
            }
          } else {
            // For text, compare strings (case-insensitive, trimmed)
            isCorrect =
              userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
          }
          
          return {
            questionId: question.id,
            question: question.question,
            userAnswer: displayUserAnswer,
            correctAnswer: displayCorrectAnswer,
            isCorrect,
          }
        })
        
        const score = results.filter((r) => r.isCorrect).length
        const totalQuestions = allQuestions.length
        
        const response: SubmitAttemptResponse = {
          attemptId: data.attemptId,
          score,
          totalQuestions,
          results,
        }
        
        console.log("📥 API Response: submitAttempt", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },
}

