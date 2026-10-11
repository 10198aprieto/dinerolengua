export const COIN_IMPACTS = [0.39, 0.67, 2.52] as const;
export const COIN_AUDIO_DURATION = 5.042;

export function coinFrame(seconds: number) {
  return {
    coins: COIN_IMPACTS.map((impact) => {
      const start = Math.max(0, impact - 0.35);
      const progress = Math.max(0, Math.min(1, (seconds - start) / (impact - start)));
      return { progress, visible: seconds >= start && seconds < impact };
    }),
    bounce: Math.max(0, ...COIN_IMPACTS.map((impact) => {
      const elapsed = seconds - impact;
      return elapsed >= 0 && elapsed < 0.32 ? Math.sin(elapsed / 0.32 * Math.PI) : 0;
    })),
  };
}

export function shouldCelebrateSave(success: boolean, action: "create" | "edit") {
  return success && (action === "create" || action === "edit");
}