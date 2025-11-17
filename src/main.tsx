import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateQuiz from "./pages/CreateQuiz"
import QuizDetail from "./pages/QuizDetail"
import { Toaster } from "./components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes/new" element={<CreateQuiz />} />
            <Route path="/quizzes/:quizId" element={<QuizDetail />} />
          </Routes>

          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
