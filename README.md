## Quiz Maker – Frontend

Please find the screen recording here: 
https://drive.google.com/file/d/1kjIsuuU9A1CA3P3qJbH8G4AnvwOGo8P7/view?usp=drive_link

## Known Issues / Limitations

- Question type `code` isn’t implemented. Quiz builder blocks you from adding it, but seeded quizzes may include it; the question renders and accepts answers, yet it will always grade as incorrect because no `correctAnswer` exists.
- Quiz metadata (title/description/publish flag/time limit) can’t be edited after creation and time limits aren’t enforced yet.
- User cannot publish/unpublish the quiz


## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**  
   Create a `.env` file (or use the existing one) with:
   ```
   VITE_BASE_API_URL=<backend REST base>
   VITE_BASE_API_TOKEN=<bearer token issued by backend>
   ```
3. **Run the app locally**
   ```bash
   npm run dev
   ```

> The backend must be running and accessible from your browser for the UI to function.

---

## Folder Structure

```
src/
├── api/            # Axios client + typed service wrappers for backend endpoints
├── components/
│   ├── questionnaire/  # In-attempt flow (dialog, question renderer, summary)
│   ├── quizBuilder/    # Quiz-creation experience: quiz-details, question-creation
│   └── ui/             # shadcn/ui primitives (buttons, cards, etc.) Everything here is generated.
├── hooks/          # Reusable hooks (e.g., anti-cheat detector)
├── lib/            # Helpers like React Query cache keys and shared utils
├── pages/          # Route-level screens (home, create quiz, detail)
├── schemas/        # Zod schemas shared between forms & services
├── types/          # TS interfaces/enums shared across the app
└── main.tsx        # App bootstrap (router + React Query provider)
```

---

## Key Dependencies

- **@tanstack/react-query** – Query/mutation layer with caching, background refresh, and request dedupe.
- **react-hook-form + zod** – Declarative form handling with schema-level validation and useful error messages.
- **shadcn/ui + Radix primitives** – Accessible UI components with design tokens that match the interview project.

---

## Technical Decisions

- **React Hook Form + Zod**  
  I chose this pair as they integrate well together. Zod makes it easy to apply validations and RHF allows me to manage form state smoothly. Plus, RHF integrates well with a lot of ui libraries and react-query!

- **shadcn/ui primitives**  
  Shadcn is the “new kid” I’ve been wanting to try. This project felt like a good excuse to use the component generator and keep the Tailwind classes maintainable. In this project, I focused more on the functionality so excuese the large amount of tailwind classes :)

- **anti-cheat implementation**
  I went to the simplest approach:
  
  - Used onPaste property of the inputs for paste events. 
  - Listened to window.onblur event for focus out events. 

  I just silently log these events by calling the Record event API. no success/error feedback to the user so they won't get distracted.


--

Feel free to open an issue or ping me if you need more context before evaluating the project. Good luck reviewing! 

