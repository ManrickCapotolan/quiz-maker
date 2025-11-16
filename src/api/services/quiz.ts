import type {
  Quiz,
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizResponse,
  QuizzesResponse,
} from "../types"

// localStorage keys
const STORAGE_QUIZZES_KEY = "quiz-maker-quizzes"
const STORAGE_QUESTIONS_KEY = "quiz-maker-questions"

// Helper functions for localStorage
const getStoredQuizzes = (): Record<string, { id: string; title: string; description?: string; timeLimit?: number; createdAt: string; updatedAt: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_QUIZZES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const setStoredQuizzes = (quizzes: Record<string, { id: string; title: string; description?: string; timeLimit?: number; createdAt: string; updatedAt: string }>) => {
  try {
    localStorage.setItem(STORAGE_QUIZZES_KEY, JSON.stringify(quizzes))
  } catch (error) {
    console.error("Error saving quizzes to localStorage:", error)
  }
}

const getStoredQuestions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_QUESTIONS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Quiz API endpoints
export const quizService = {
  // Get all quizzes
  getQuizzes: async (): Promise<QuizzesResponse> => {
    console.log("📤 API Call: getQuizzes")
    // Mocked - read from localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedQuizzes = getStoredQuizzes()
        const quizzes = Object.values(storedQuizzes).map((q) => ({
          ...q,
          questions: [], // Don't include questions in list view
        }))
        
        const response = {
          quizzes,
          total: quizzes.length,
        }
        console.log("📥 API Response: getQuizzes", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Get quiz by ID
  getQuizById: async (id: string): Promise<QuizResponse> => {
    console.log("📤 API Call: getQuizById", { id })
    // Mocked - read from localStorage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedQuizzes = getStoredQuizzes()
        const storedQuestions = getStoredQuestions()
        const quiz = storedQuizzes[id]
        const questions = storedQuestions[id] || []
        
        if (!quiz) {
          console.log("📥 API Response: getQuizById - NOT FOUND")
          reject(new Error("Quiz not found"))
          return
        }
        
        const response = {
          quiz: {
            ...quiz,
            questions,
          },
        }
        console.log("📥 API Response: getQuizById", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Create a new quiz
  createQuiz: async (data: CreateQuizRequest): Promise<QuizResponse> => {
    console.log("📤 API Call: createQuiz", JSON.stringify(data, null, 2))
    // Mocked - save to localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const quizId = `quiz-${Date.now()}`
        const createdAt = new Date().toISOString()
        const updatedAt = createdAt
        
        const quiz = {
          id: quizId,
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          createdAt,
          updatedAt,
          questions: [],
        }
        
        // Store quiz metadata in localStorage
        const storedQuizzes = getStoredQuizzes()
        storedQuizzes[quizId] = {
          id: quizId,
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          createdAt,
          updatedAt,
        }
        setStoredQuizzes(storedQuizzes)
        
        const response = { quiz }
        console.log("📥 API Response: createQuiz", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Update quiz
  updateQuiz: async (
    id: string,
    data: UpdateQuizRequest
  ): Promise<QuizResponse> => {
    console.log("📤 API Call: updateQuiz", { id, data: JSON.stringify(data, null, 2) })
    // Mocked - update in localStorage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedQuizzes = getStoredQuizzes()
        const storedQuestions = getStoredQuestions()
        const quiz = storedQuizzes[id]
        
        if (!quiz) {
          reject(new Error("Quiz not found"))
          return
        }
        
        const updatedQuiz = {
          ...quiz,
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          updatedAt: new Date().toISOString(),
        }
        
        storedQuizzes[id] = updatedQuiz
        setStoredQuizzes(storedQuizzes)
        
        const response = {
          quiz: {
            ...updatedQuiz,
            questions: storedQuestions[id] || [],
          },
        }
        console.log("📥 API Response: updateQuiz", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<void> => {
    console.log("📤 API Call: deleteQuiz", { id })
    // Mocked - delete from localStorage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedQuizzes = getStoredQuizzes()
        const storedQuestions = getStoredQuestions()
        
        if (!storedQuizzes[id]) {
          reject(new Error("Quiz not found"))
          return
        }
        
        // Delete quiz metadata
        delete storedQuizzes[id]
        setStoredQuizzes(storedQuizzes)
        
        // Delete questions for this quiz
        delete storedQuestions[id]
        try {
          localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(storedQuestions))
        } catch (error) {
          console.error("Error deleting questions from localStorage:", error)
        }
        
        console.log("📥 API Response: deleteQuiz - success")
        resolve()
      }, 500)
    })
  },
}

