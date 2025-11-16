import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useStartAttempt } from "@/hooks/useAttempt"

export default function Home() {
  const [quizId, setQuizId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const startAttempt = useStartAttempt()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizId.trim()) return

    setError(null)
    startAttempt.mutate(
      { quizId: quizId.trim() },
      {
        onSuccess: (response) => {
          navigate(`/attempts/${response.attemptId}`)
        },
        onError: (err) => {
          setError("Quiz not found. Please check the Quiz ID and try again.")
          console.error("Error starting attempt:", err)
        },
      }
    )
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
      <h1 className="mb-8 text-center text-3xl font-bold text-card-foreground">
        QUIZ MAKER
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="quizId">Quiz ID</FieldLabel>
          <Input
            id="quizId"
            type="text"
            placeholder="Enter Quiz ID"
            value={quizId}
            onChange={(e) => {
              setQuizId(e.target.value)
              setError(null)
            }}
            className="w-full"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        
        <Button
          type="submit"
          className="w-full"
          disabled={startAttempt.isPending || !quizId.trim()}
        >
          {startAttempt.isPending ? "Starting..." : "Start Quiz"}
        </Button>
        
        <Link to="/quizzes/new" className="block text-center text-sm text-primary">
          Create a new quiz
        </Link>
      </form>
    </div>
  )
}
