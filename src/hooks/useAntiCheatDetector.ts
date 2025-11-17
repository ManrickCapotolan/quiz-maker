import { useEffect, useReducer } from "react";
import { useMutation } from "@tanstack/react-query";
import { AntiCheatEventEnum, type AntiCheatEventType } from "@/types/attempt";
import { attemptService } from "@/api/services/attempt";

interface UseAntiCheatDetectorOptions {
  attemptId: number;
  enabled: boolean;
}

export function useAntiCheatDetector({
  attemptId,
  enabled
}: UseAntiCheatDetectorOptions) {
  const [antiCheatEvents, incrementAntiCheatEvent] = useReducer(
    (state, key: AntiCheatEventType) => {
      return {
        ...state,
        [key]: state[key] + 1,
      };
    },
    {
      [AntiCheatEventEnum.Blur]: 0,
      [AntiCheatEventEnum.Paste]: 0,
    },
  );

  const recordEventMutation = useMutation({
    mutationFn: async (eventType: AntiCheatEventType) =>
      attemptService.recordEvent(attemptId, eventType),
  });

  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      incrementAntiCheatEvent(AntiCheatEventEnum.Blur);
      recordEventMutation.mutate(AntiCheatEventEnum.Blur);
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled]);

  const logPasteEvent = () => {
    incrementAntiCheatEvent(AntiCheatEventEnum.Paste);
    recordEventMutation.mutate(AntiCheatEventEnum.Paste);
  };

  return {
    antiCheatEvents,
    logPasteEvent,
  };
}
