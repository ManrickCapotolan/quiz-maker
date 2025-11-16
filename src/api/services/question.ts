import type {
  Question,
  CreateQuestionRequest,
  CreateQuestionsRequest,
} from "../types"

// localStorage key for storing questions
const STORAGE_KEY = "quiz-maker-questions"

// Helper functions for localStorage
const getStoredQuestions = (): Record<string, Question[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const setStoredQuestions = (questions: Record<string, Question[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Question API endpoints
export const questionService = {
  // Create a single question
  createQuestion: async (data: CreateQuestionRequest): Promise<Question> => {
    console.log("📤 API Call: createQuestion", JSON.stringify(data, null, 2))
    // Mocked - save to localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = getStoredQuestions()
        const quizQuestions = stored[data.quizId] || []
        
        const newQuestion: Question = {
          id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          quizId: data.quizId,
          question: data.question,
          type: data.type,
          options: data.options,
          correctAnswer: data.correctAnswer,
          order: quizQuestions.length,
        }
        
        stored[data.quizId] = [...quizQuestions, newQuestion]
        setStoredQuestions(stored)
        
        console.log("📥 API Response: createQuestion", JSON.stringify(newQuestion, null, 2))
        resolve(newQuestion)
      }, 500)
    })
  },

  // Create multiple questions at once
  createQuestions: async (data: CreateQuestionsRequest): Promise<Question[]> => {
    console.log("📤 API Call: createQuestions", JSON.stringify(data, null, 2))
    // Mocked - save to localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = getStoredQuestions()
        const quizQuestions = stored[data.quizId] || []
        
        const newQuestions: Question[] = data.questions.map((q, index) => ({
          id: `question-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          quizId: data.quizId,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: quizQuestions.length + index,
        }))
        
        stored[data.quizId] = [...quizQuestions, ...newQuestions]
        setStoredQuestions(stored)
        
        console.log("📥 API Response: createQuestions", JSON.stringify(newQuestions, null, 2))
        resolve(newQuestions)
      }, 500)
    })
  },

  // Get questions for a quiz
  getQuestionsByQuizId: async (quizId: string): Promise<Question[]> => {
    console.log("📤 API Call: getQuestionsByQuizId", { quizId })
    // Mocked - read from localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = getStoredQuestions()
        const response: Question[] = stored[quizId] || []
        console.log("📥 API Response: getQuestionsByQuizId", JSON.stringify(response, null, 2))
        resolve(response)
      }, 500)
    })
  },

  // Update a question
  updateQuestion: async (
    quizId: string,
    questionId: string,
    data: Partial<CreateQuestionRequest>
  ): Promise<Question> => {
    console.log("📤 API Call: updateQuestion", {
      quizId,
      questionId,
      data: JSON.stringify(data, null, 2),
    })
    // Mocked - update in localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = getStoredQuestions()
        const quizQuestions = stored[quizId] || []
        const questionIndex = quizQuestions.findIndex((q) => q.id === questionId)
        
        if (questionIndex === -1) {
          throw new Error("Question not found")
        }
        
        const updatedQuestion: Question = {
          ...quizQuestions[questionIndex],
          ...(data.question && { question: data.question }),
          ...(data.type && { type: data.type }),
          ...(data.options !== undefined && { options: data.options }),
          ...(data.correctAnswer !== undefined && { correctAnswer: data.correctAnswer }),
        }
        
        quizQuestions[questionIndex] = updatedQuestion
        stored[quizId] = quizQuestions
        setStoredQuestions(stored)
        
        console.log("📥 API Response: updateQuestion", JSON.stringify(updatedQuestion, null, 2))
        resolve(updatedQuestion)
      }, 500)
    })
  },

  // Delete a question
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    console.log("📤 API Call: deleteQuestion", { quizId, questionId })
    // Mocked - delete from localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = getStoredQuestions()
        const quizQuestions = stored[quizId] || []
        const filtered = quizQuestions.filter((q) => q.id !== questionId)
        
        // Update order for remaining questions
        const reordered = filtered.map((q, index) => ({ ...q, order: index }))
        
        stored[quizId] = reordered
        setStoredQuestions(stored)
        
        console.log("📥 API Response: deleteQuestion - success")
        resolve()
      }, 500)
    })
  },
}

