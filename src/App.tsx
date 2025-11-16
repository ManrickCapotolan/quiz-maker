import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { queryClient } from "./lib/queryClient"
import Home from "./pages/Home"
import CreateQuiz from "./pages/CreateQuiz"
import QuizDetail from "./pages/QuizDetail"
import Attempt from "./pages/Attempt"
import ThemeToggle from "./components/ThemeToggle"
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes/new" element={<CreateQuiz />} />
            <Route path="/quizzes/:quizId" element={<QuizDetail />} />
            <Route path="/attempts/:attemptId" element={<Attempt />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App