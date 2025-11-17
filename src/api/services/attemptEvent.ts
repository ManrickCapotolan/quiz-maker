// Event types for quiz attempts
export type AttemptEventType = "paste" | "blur" | "focus" | "copy" | "cut";

export interface AttemptEvent {
  attemptId: string;
  questionId: string;
  eventType: AttemptEventType;
  timestamp: string;
  value?: string; // For paste events, the pasted value
}

// localStorage key for storing attempt events
const STORAGE_ATTEMPT_EVENTS_KEY = "quiz-maker-attempt-events";

// Helper functions for localStorage
const getStoredEvents = (): Record<string, AttemptEvent[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_ATTEMPT_EVENTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const setStoredEvents = (events: Record<string, AttemptEvent[]>) => {
  try {
    localStorage.setItem(STORAGE_ATTEMPT_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Error saving attempt events to localStorage:", error);
  }
};

// Log an attempt event
export const logAttemptEvent = (event: AttemptEvent): void => {
  console.log("📝 Attempt Event:", event);

  const storedEvents = getStoredEvents();
  const attemptId = event.attemptId;

  if (!storedEvents[attemptId]) {
    storedEvents[attemptId] = [];
  }

  storedEvents[attemptId].push(event);
  setStoredEvents(storedEvents);
};

// Get all events for an attempt
export const getAttemptEvents = (attemptId: string): AttemptEvent[] => {
  const storedEvents = getStoredEvents();
  return storedEvents[attemptId] || [];
};

// Get events for a specific question in an attempt
export const getQuestionEvents = (
  attemptId: string,
  questionId: string,
): AttemptEvent[] => {
  const events = getAttemptEvents(attemptId);
  return events.filter((e) => e.questionId === questionId);
};
