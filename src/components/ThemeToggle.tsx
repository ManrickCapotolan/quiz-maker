import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") return true
    if (stored === "light") return false
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      className="inline-flex items-center rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm hover:bg-accent"
      aria-label="Toggle theme"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  )
}
